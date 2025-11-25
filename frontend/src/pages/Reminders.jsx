import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pill, Clock, Calendar, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'once-daily',
    timing: ['08:00'],
    startDate: '',
    endDate: '',
    notes: '',
    emailNotification: true
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data } = await axios.get('/api/reminders');
      setReminders(data.reminders);
    } catch (error) {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTimingChange = (index, value) => {
    const newTiming = [...formData.timing];
    newTiming[index] = value;
    setFormData({ ...formData, timing: newTiming });
  };

  const addTiming = () => {
    setFormData({
      ...formData,
      timing: [...formData.timing, '08:00']
    });
  };

  const removeTiming = (index) => {
    const newTiming = formData.timing.filter((_, i) => i !== index);
    setFormData({ ...formData, timing: newTiming });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/reminders', formData);
      toast.success('Reminder created successfully!');
      setShowForm(false);
      setFormData({
        medicineName: '',
        dosage: '',
        frequency: 'once-daily',
        timing: ['08:00'],
        startDate: '',
        endDate: '',
        notes: '',
        emailNotification: true
      });
      fetchReminders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create reminder');
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`/api/reminders/${id}/toggle`);
      toast.success('Reminder status updated');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to toggle reminder');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    
    try {
      await axios.delete(`/api/reminders/${id}`);
      toast.success('Reminder deleted');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  const getFrequencyBadge = (frequency) => {
    const badges = {
      'once-daily': { color: 'bg-blue-100 text-blue-800', text: 'Once Daily' },
      'twice-daily': { color: 'bg-green-100 text-green-800', text: 'Twice Daily' },
      'thrice-daily': { color: 'bg-purple-100 text-purple-800', text: 'Thrice Daily' },
      'weekly': { color: 'bg-yellow-100 text-yellow-800', text: 'Weekly' },
      'monthly': { color: 'bg-pink-100 text-pink-800', text: 'Monthly' }
    };
    return badges[frequency] || badges['once-daily'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medicine Reminders</h1>
            <p className="mt-2 text-gray-600">Manage your medication schedule</p>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Reminder
          </button>
        </div>

        {/* Create Reminder Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Reminder</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    name="medicineName"
                    required
                    value={formData.medicineName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Aspirin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    required
                    value={formData.dosage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 1 tablet, 500mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency *
                  </label>
                  <select
                    name="frequency"
                    required
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="once-daily">Once Daily</option>
                    <option value="twice-daily">Twice Daily</option>
                    <option value="thrice-daily">Thrice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timing *
                  </label>
                  {formData.timing.map((time, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimingChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      {formData.timing.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTiming(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTiming}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add another time
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="emailNotification"
                  id="emailNotification"
                  checked={formData.emailNotification}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotification" className="ml-2 block text-sm text-gray-700">
                  Send email notifications
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Pill className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No reminders yet</h3>
            <p className="mt-2 text-gray-600">Create your first medicine reminder to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => {
              const badge = getFrequencyBadge(reminder.frequency);
              return (
                <div key={reminder._id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-lg ${reminder.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Pill className={`h-6 w-6 ${reminder.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{reminder.medicineName}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                            {badge.text}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          <strong>Dosage:</strong> {reminder.dosage}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {reminder.timing.join(', ')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(reminder.startDate).toLocaleDateString()} - {new Date(reminder.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {reminder.notes && (
                          <p className="mt-2 text-sm text-gray-600 italic">{reminder.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleToggle(reminder._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={reminder.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {reminder.isActive ? (
                          <ToggleRight className="h-6 w-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
