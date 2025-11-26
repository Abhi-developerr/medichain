import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Pill, Plus, Clock, Calendar, TrendingUp, AlertTriangle, X, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function MedicationTracker() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: { amount: '', unit: 'mg' },
    frequency: 'once-daily',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    purpose: '',
    instructions: '',
    totalPills: '',
    pillsRemaining: ''
  });

  useEffect(() => {
    loadMedications();
    loadStats();
  }, []);

  const loadMedications = async () => {
    try {
      const { data } = await axios.get('/api/medication-tracker');
      setMedications(Array.isArray(data.medications) ? data.medications : []);
    } catch (error) {
      toast.error('Failed to load medications');
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await axios.get('/api/medication-tracker/stats');
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/medication-tracker', formData);
      toast.success('Medication added successfully!');
      setShowModal(false);
      resetForm();
      loadMedications();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add medication');
    }
  };

  const resetForm = () => {
    setFormData({
      medicationName: '',
      dosage: { amount: '', unit: 'mg' },
      frequency: 'once-daily',
      startDate: '',
      endDate: '',
      prescribedBy: '',
      purpose: '',
      instructions: '',
      totalPills: '',
      pillsRemaining: ''
    });
  };

  const logAdherence = async (id, taken) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    try {
      await axios.post(`/api/medication-tracker/${id}/log`, { time, taken });
      toast.success(taken ? 'Medication taken!' : 'Skipped logged');
      loadMedications();
      loadStats();
    } catch (error) {
      toast.error('Failed to log');
    }
  };

  const deleteMedication = async (id) => {
    if (!window.confirm('Delete this medication?')) return;
    try {
      await axios.delete(`/api/medication-tracker/${id}`);
      toast.success('Medication deleted');
      loadMedications();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      paused: 'bg-yellow-100 text-yellow-700',
      discontinued: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Medication Tracker
          </h1>
          <p className="text-gray-600">Manage your medications and track adherence</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Adherence</p>
            <p className="text-3xl font-bold text-purple-600">{stats.averageAdherence?.toFixed(0) || 0}%</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Need Refill</p>
            <p className="text-3xl font-bold text-orange-600">{stats.needsRefill || 0}</p>
          </div>
        </div>

        {/* Add Medication Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Medication
        </button>

        {/* Medications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No medications yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {medications.map((med) => (
              <div key={med._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Pill className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{med.medicationName}</h3>
                      <p className="text-sm text-gray-600">
                        {med.dosage.amount} {med.dosage.unit} - {med.frequency}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${getStatusColor(med.status)}`}>
                        {med.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMedication(med._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {med.purpose && (
                  <div className="mb-3 bg-blue-50 rounded-lg p-2">
                    <p className="text-xs font-medium text-blue-900">Purpose:</p>
                    <p className="text-sm text-gray-700">{med.purpose}</p>
                  </div>
                )}

                {/* Adherence Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Adherence Rate</span>
                    <span className="font-bold text-green-600">{med.adherenceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${med.adherenceRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Pills Remaining */}
                {med.pillsRemaining !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Pills Remaining</span>
                      <span className={`font-bold ${med.needsRefill ? 'text-red-600' : 'text-gray-900'}`}>
                        {med.pillsRemaining}/{med.totalPills}
                      </span>
                    </div>
                    {med.needsRefill && (
                      <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                        <AlertTriangle className="h-3 w-3" />
                        Refill needed soon
                      </div>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span>Started: {new Date(med.startDate).toLocaleDateString()}</span>
                  {med.endDate && <span>Ends: {new Date(med.endDate).toLocaleDateString()}</span>}
                </div>

                {/* Action Buttons */}
                {med.status === 'active' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => logAdherence(med._id, true)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Taken
                    </button>
                    <button
                      onClick={() => logAdherence(med._id, false)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm"
                    >
                      <X className="h-4 w-4" />
                      Skipped
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Medication Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add Medication</h2>
                <button onClick={() => { setShowModal(false); resetForm(); }}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Medication Name</label>
                  <input
                    type="text"
                    required
                    value={formData.medicationName}
                    onChange={(e) => setFormData({...formData, medicationName: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Dosage Amount</label>
                    <input
                      type="text"
                      required
                      value={formData.dosage.amount}
                      onChange={(e) => setFormData({...formData, dosage: {...formData.dosage, amount: e.target.value}})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit</label>
                    <select
                      value={formData.dosage.unit}
                      onChange={(e) => setFormData({...formData, dosage: {...formData.dosage, unit: e.target.value}})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="mg">mg</option>
                      <option value="ml">ml</option>
                      <option value="tablets">tablets</option>
                      <option value="capsules">capsules</option>
                      <option value="drops">drops</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="once-daily">Once Daily</option>
                    <option value="twice-daily">Twice Daily</option>
                    <option value="thrice-daily">Three Times Daily</option>
                    <option value="four-times-daily">Four Times Daily</option>
                    <option value="as-needed">As Needed</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Pills</label>
                    <input
                      type="number"
                      value={formData.totalPills}
                      onChange={(e) => setFormData({...formData, totalPills: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pills Remaining</label>
                    <input
                      type="number"
                      value={formData.pillsRemaining}
                      onChange={(e) => setFormData({...formData, pillsRemaining: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prescribed By</label>
                  <input
                    type="text"
                    value={formData.prescribedBy}
                    onChange={(e) => setFormData({...formData, prescribedBy: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Purpose</label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Instructions</label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="2"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                  >
                    Add Medication
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
