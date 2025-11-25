import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Pill, Plus, X, Calendar, FileText, AlertCircle, User, Save } from 'lucide-react';

const Prescriptions = () => {
  const { API_URL, user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patient: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: 'twice-daily', duration: '', instructions: '', beforeFood: false }],
    labTests: [],
    generalInstructions: '',
    followUpDate: '',
    followUpInstructions: '',
    validUntil: ''
  });

  useEffect(() => {
    fetchPrescriptions();
    if (user.role === 'doctor') {
      fetchPatients();
    }
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/prescriptions`);
      setPrescriptions(response.data.prescriptions);
    } catch (error) {
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/patients`);
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Fetch patients error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Please log in to view patients');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch patients');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/prescriptions`, formData);
      toast.success('Prescription created successfully!');
      setShowModal(false);
      resetForm();
      fetchPrescriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    }
  };

  const resetForm = () => {
    setFormData({
      patient: '',
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: 'twice-daily', duration: '', instructions: '', beforeFood: false }],
      labTests: [],
      generalInstructions: '',
      followUpDate: '',
      followUpInstructions: '',
      validUntil: ''
    });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: 'twice-daily', duration: '', instructions: '', beforeFood: false }]
    });
  };

  const removeMedication = (index) => {
    const newMeds = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMeds });
  };

  const updateMedication = (index, field, value) => {
    const newMeds = [...formData.medications];
    newMeds[index][field] = value;
    setFormData({ ...formData, medications: newMeds });
  };

  const viewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2 flex items-center gap-3">
              <Pill className="h-10 w-10 text-blue-600" />
              Prescriptions
            </h1>
            <p className="text-gray-600">Manage medical prescriptions</p>
          </div>
          {user.role === 'doctor' && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Prescription
            </button>
          )}
        </div>

        {/* Prescriptions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No prescriptions found</h3>
            <p className="text-gray-600">Your prescriptions will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prescriptions.map((prescription, index) => (
              <div
                key={prescription._id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all animate-slide-up cursor-pointer"
                style={{animationDelay: `${index * 0.05}s`}}
                onClick={() => viewPrescription(prescription)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Pill className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{prescription.diagnosis}</h3>
                      <p className="text-sm text-gray-600">
                        {user.role === 'patient' ? `Dr. ${prescription.doctor?.name}` : prescription.patient?.name}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                    prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {prescription.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {new Date(prescription.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{prescription.medications.length} medication(s) prescribed</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Medications:</p>
                  <div className="flex flex-wrap gap-2">
                    {prescription.medications.slice(0, 3).map((med, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                        {med.name}
                      </span>
                    ))}
                    {prescription.medications.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                        +{prescription.medications.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in my-8">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Pill className="h-6 w-6" />
                  Create Prescription
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient *
                </label>
                <select
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select patient...</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diagnosis *
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter diagnosis..."
                  required
                />
              </div>

              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Medications *
                  </label>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-semibold flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Medication
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.medications.map((med, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-700">Medication {index + 1}</h4>
                        {formData.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Medicine name"
                            required
                          />
                        </div>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Dosage (e.g., 500mg)"
                          required
                        />
                        <select
                          value={med.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="once-daily">Once Daily</option>
                          <option value="twice-daily">Twice Daily</option>
                          <option value="thrice-daily">Thrice Daily</option>
                          <option value="four-times-daily">Four Times Daily</option>
                          <option value="as-needed">As Needed</option>
                        </select>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Duration (e.g., 7 days)"
                          required
                        />
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={med.beforeFood}
                            onChange={(e) => updateMedication(index, 'beforeFood', e.target.checked)}
                            className="mr-2"
                          />
                          <label className="text-sm text-gray-700">Before Food</label>
                        </div>
                        <textarea
                          value={med.instructions}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows="2"
                          placeholder="Special instructions..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  General Instructions
                </label>
                <textarea
                  value={formData.generalInstructions}
                  onChange={(e) => setFormData({ ...formData, generalInstructions: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="General instructions for the patient..."
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  Create Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Prescription Details</h2>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient/Doctor Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Patient</p>
                  <p className="text-gray-900 font-semibold">{selectedPrescription.patient?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Doctor</p>
                  <p className="text-gray-900 font-semibold">Dr. {selectedPrescription.doctor?.name}</p>
                  <p className="text-sm text-gray-600">{selectedPrescription.doctor?.specialization}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Diagnosis</p>
                <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">{selectedPrescription.diagnosis}</p>
              </div>

              {/* Medications */}
              <div>
                <p className="text-sm text-gray-600 font-medium mb-3">Medications</p>
                <div className="space-y-3">
                  {selectedPrescription.medications.map((med, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{med.name}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {med.duration}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="text-gray-600">Dosage:</span> <span className="font-medium">{med.dosage}</span></p>
                        <p><span className="text-gray-600">Frequency:</span> <span className="font-medium">{med.frequency.replace('-', ' ')}</span></p>
                        <p className="col-span-2"><span className="text-gray-600">Timing:</span> <span className="font-medium">{med.beforeFood ? 'Before Food' : 'After Food'}</span></p>
                        {med.instructions && (
                          <p className="col-span-2 text-gray-700 italic">{med.instructions}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Instructions */}
              {selectedPrescription.generalInstructions && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">General Instructions</p>
                  <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg">{selectedPrescription.generalInstructions}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Created On</p>
                  <p className="text-gray-900">{new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Valid Until</p>
                  <p className="text-gray-900">{new Date(selectedPrescription.validUntil).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
