import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Video, Plus, Calendar, Clock, X, Star } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function VideoConsultations() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    scheduledDate: '',
    duration: 30,
    reason: '',
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    loadConsultations();
    loadStats();
    if (user?.role === 'patient') loadDoctors();
  }, []);

  const loadConsultations = async () => {
    try {
      const { data } = await axios.get('/api/video-consultations');
      setConsultations(Array.isArray(data.consultations) ? data.consultations : []);
    } catch (error) {
      toast.error('Failed to load consultations');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await axios.get('/api/video-consultations/stats');
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const loadDoctors = async () => {
    try {
      const { data } = await axios.get('/api/admin/users?role=doctor');
      setDoctors(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      console.error('Failed to load doctors');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(s => s)
      };
      await axios.post('/api/video-consultations', payload);
      toast.success('Consultation scheduled successfully!');
      setShowModal(false);
      setFormData({ doctorId: '', scheduledDate: '', duration: 30, reason: '', symptoms: '', notes: '' });
      loadConsultations();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule consultation');
    }
  };

  const cancelConsultation = async (id) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    
    try {
      await axios.put(`/api/video-consultations/${id}/cancel`, { cancelReason: reason });
      toast.success('Consultation cancelled');
      loadConsultations();
      loadStats();
    } catch (error) {
      toast.error('Failed to cancel consultation');
    }
  };

  const rateConsultation = async (id) => {
    const rating = prompt('Rate this consultation (1-5):');
    if (!rating || rating < 1 || rating > 5) return;
    
    const feedback = prompt('Any feedback? (optional)');
    
    try {
      await axios.put(`/api/video-consultations/${id}/rate`, { 
        rating: parseInt(rating), 
        feedback 
      });
      toast.success('Thank you for your feedback!');
      loadConsultations();
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
      missed: 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Video Consultations
          </h1>
          <p className="text-gray-600">Connect with doctors virtually</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Upcoming</p>
            <p className="text-3xl font-bold text-green-600">{stats.upcoming || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-purple-600">{stats.completed || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Rating</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.averageRating?.toFixed(1) || 'N/A'}</p>
          </div>
        </div>

        {/* Schedule Button */}
        {user?.role === 'patient' && (
          <button
            onClick={() => setShowModal(true)}
            className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            Schedule Consultation
          </button>
        )}

        {/* Consultations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No consultations yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {consultations.map((consultation) => (
              <div key={consultation._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Video className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {user?.role === 'patient' 
                          ? `Dr. ${consultation.doctor?.name}`
                          : consultation.patient?.name}
                      </h3>
                      <p className="text-sm text-gray-600">{consultation.reason}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                        {consultation.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(consultation.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {new Date(consultation.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>

                {consultation.symptoms && consultation.symptoms.length > 0 && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Symptoms:</p>
                    <div className="flex flex-wrap gap-2">
                      {consultation.symptoms.map((symptom, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {consultation.doctorNotes && (
                  <div className="mb-4 bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900 mb-1">Doctor's Notes:</p>
                    <p className="text-sm text-gray-700">{consultation.doctorNotes}</p>
                  </div>
                )}

                {consultation.prescription && (
                  <div className="mb-4 bg-green-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-900 mb-1">Prescription:</p>
                    <p className="text-sm text-gray-700">{consultation.prescription}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {consultation.status === 'scheduled' && (
                    <>
                      {consultation.meetingLink && (
                        <a
                          href={consultation.meetingLink}
                          className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-center font-medium"
                        >
                          Join Meeting
                        </a>
                      )}
                      <button
                        onClick={() => cancelConsultation(consultation._id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {consultation.status === 'completed' && user?.role === 'patient' && !consultation.rating && (
                    <button
                      onClick={() => rateConsultation(consultation._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100"
                    >
                      <Star className="h-4 w-4" />
                      Rate Consultation
                    </button>
                  )}
                  {consultation.rating && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      Rated: {consultation.rating}/5
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Schedule Consultation</h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Doctor</label>
                  <select
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} {doctor.specialization && `- ${doctor.specialization}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Consultation</label>
                  <input
                    type="text"
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Follow-up, Health checkup"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Symptoms (comma separated)</label>
                  <input
                    type="text"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., headache, fever, cough"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                  >
                    Schedule
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
