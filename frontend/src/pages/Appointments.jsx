import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Video, MapPin, User, CheckCircle, XCircle, Plus, Filter, Phone } from 'lucide-react';

const Appointments = () => {
  const { API_URL, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctor: '',
    title: '',
    description: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    type: 'consultation',
    location: 'in-person',
    meetingLink: ''
  });

  useEffect(() => {
    fetchAppointments();
    if (user.role === 'patient') {
      fetchDoctors();
    }
  }, [filter]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/doctors`);
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Failed to fetch doctors');
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = filter === 'upcoming' ? { upcoming: true } : filter === 'past' ? { past: true } : {};
      const response = await axios.get(`${API_URL}/appointments`, { params });
      setAppointments(response.data.appointments);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, reason = '') => {
    try {
      await axios.put(`${API_URL}/appointments/${id}/status`, { 
        status, 
        cancellationReason: reason 
      });
      toast.success('Appointment updated');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    if (!formData.doctor || !formData.title || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      
      await axios.post(`${API_URL}/appointments`, {
        doctor: formData.doctor,
        title: formData.title,
        description: formData.description,
        appointmentDate: appointmentDateTime.toISOString(),
        duration: formData.duration,
        type: formData.type,
        location: formData.location,
        meetingLink: formData.meetingLink
      });

      toast.success('Appointment booked successfully!');
      setShowModal(false);
      resetForm();
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const resetForm = () => {
    setFormData({
      doctor: '',
      title: '',
      description: '',
      appointmentDate: '',
      appointmentTime: '',
      duration: 30,
      type: 'consultation',
      location: 'in-person',
      meetingLink: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-purple-100 text-purple-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.scheduled;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAppointmentTypeIcon = (type) => {
    switch (type) {
      case 'video-call':
        return { icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'phone-call':
        return { icon: Phone, color: 'text-green-600', bg: 'bg-green-50' };
      case 'in-person':
        return { icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' };
      default:
        return { icon: Calendar, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const formatAppointmentType = (type) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2 flex items-center gap-3">
              <Calendar className="h-10 w-10 text-blue-600" />
              Appointments
            </h1>
            <p className="text-gray-600">Manage your medical appointments</p>
          </div>
          {user.role === 'patient' && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Book Appointment
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex gap-2">
          {['upcoming', 'all', 'past'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
            <p className="text-gray-600">Your appointments will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt, index) => (
              <div
                key={apt._id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all animate-slide-up"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{apt.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(apt.appointmentDate)} at {formatTime(apt.appointmentDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {user.role === 'patient' ? `Dr. ${apt.doctor.name}` : apt.patient.name}
                          </span>
                          {(() => {
                            const typeInfo = getAppointmentTypeIcon(apt.type || apt.location);
                            const TypeIcon = typeInfo.icon;
                            return (
                              <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${typeInfo.bg} ${typeInfo.color} font-medium`}>
                                <TypeIcon className="h-4 w-4" />
                                {formatAppointmentType(apt.type || apt.location)}
                              </span>
                            );
                          })()}
                        </div>
                        {apt.description && (
                          <p className="text-gray-600 text-sm mb-2">{apt.description}</p>
                        )}
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {apt.status === 'scheduled' && (
                    <div className="flex gap-2">
                      {user.role === 'doctor' && (
                        <button
                          onClick={() => updateStatus(apt._id, 'confirmed')}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all font-semibold text-sm flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Confirm
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const reason = prompt('Cancellation reason (optional):');
                          updateStatus(apt._id, 'cancelled', reason || '');
                        }}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-sm flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Book Appointment
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Doctor *
                </label>
                <select
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} {doc.specialization ? `- ${doc.specialization}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Regular Checkup, Follow-up Visit"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Brief description of your concerns..."
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Duration and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Appointment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="routine-checkup">Routine Checkup</option>
                    <option value="specialist">Specialist</option>
                  </select>
                </div>
              </div>

              {/* Meeting Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meeting Location
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="in-person">In-Person</option>
                  <option value="video-call">Video Call</option>
                  <option value="phone-call">Phone Call</option>
                </select>
              </div>

              {/* Meeting Link (if video call) */}
              {formData.location === 'video-call' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meeting Link (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}

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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
