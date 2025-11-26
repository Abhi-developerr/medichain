import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

function Telemedicine() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    duration: 30,
    type: 'video',
    symptoms: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/telemedicine');
      setAppointments(response.data.appointments);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/telemedicine', formData);
      toast.success('Appointment scheduled successfully');
      setShowModal(false);
      setFormData({ appointmentDate: '', duration: 30, type: 'video', symptoms: '' });
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule appointment');
    }
  };

  const handleStartSession = async (id) => {
    try {
      const response = await api.put(`/telemedicine/${id}/start`);
      window.open(response.data.appointment.meetingLink, '_blank');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start session');
    }
  };

  const handleRating = async (id, score) => {
    try {
      await api.post(`/telemedicine/${id}/rating`, { score });
      toast.success('Rating submitted');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Telemedicine</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Schedule Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map(appointment => (
          <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {appointment.doctor?.name || 'Dr. Unknown'}
                </h3>
                <p className="text-sm text-gray-600">{appointment.doctor?.specialty}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Date:</span>{' '}
                {new Date(appointment.appointmentDate).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Duration:</span> {appointment.duration} minutes
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span>{' '}
                <span className="capitalize">{appointment.type}</span>
              </p>
            </div>

            {appointment.symptoms && (
              <p className="text-sm text-gray-700 mb-4">
                <span className="font-medium">Symptoms:</span> {appointment.symptoms}
              </p>
            )}

            {appointment.status === 'scheduled' && (
              <button
                onClick={() => handleStartSession(appointment._id)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Join Session
              </button>
            )}

            {appointment.status === 'completed' && (
              <div>
                {appointment.diagnosis && (
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis</p>
                    <p className="text-sm text-gray-600">{appointment.diagnosis}</p>
                  </div>
                )}
                {!appointment.rating && (
                  <div>
                    <p className="text-sm font-medium mb-2">Rate this consultation</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(score => (
                        <button
                          key={score}
                          onClick={() => handleRating(appointment._id, score)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          ★ {score}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No appointments scheduled</p>
        </div>
      )}

      {/* Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Schedule Appointment</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="video">Video Call</option>
                    <option value="audio">Audio Call</option>
                    <option value="chat">Chat Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms / Reason
                  </label>
                  <textarea
                    rows="3"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your symptoms..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Telemedicine;
