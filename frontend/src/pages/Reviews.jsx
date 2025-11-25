import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Star, ThumbsUp, MessageSquare, X, Award, TrendingUp, Users, Send } from 'lucide-react';

const Reviews = () => {
  const { API_URL, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    doctor: '',
    rating: 5,
    professionalism: 5,
    communication: 5,
    punctuality: 5,
    thoroughness: 5,
    comment: '',
    isAnonymous: false
  });
  const [responseText, setResponseText] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    if (user.role === 'patient') {
      fetchDoctors();
    } else if (user.role === 'doctor') {
      fetchMyReviews();
    }
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/doctors`);
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Fetch doctors error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Please log in to view doctors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch doctors');
      }
    }
  };

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reviews/doctor/${user._id}`);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Fetch my reviews error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Please log in to view reviews');
      } else if (error.response?.status === 500) {
        toast.error(error.response?.data?.message || 'Server error fetching reviews');
      } else {
        toast.error('Failed to fetch reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorReviews = async (doctorId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reviews/doctor/${doctorId}`);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
      const doctor = doctors.find(d => d._id === doctorId);
      setSelectedDoctor(doctor);
    } catch (error) {
      console.error('Fetch doctor reviews error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Please log in to view reviews');
      } else if (error.response?.status === 500) {
        toast.error(error.response?.data?.message || 'Server error fetching reviews');
      } else {
        toast.error('Failed to fetch reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/reviews`, formData);
      toast.success('Review submitted successfully!');
      setShowModal(false);
      resetForm();
      if (selectedDoctor) {
        fetchDoctorReviews(selectedDoctor._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await axios.put(`${API_URL}/reviews/${reviewId}/helpful`);
      toast.success('Thank you for your feedback!');
      if (user.role === 'doctor') {
        fetchMyReviews();
      } else if (selectedDoctor) {
        fetchDoctorReviews(selectedDoctor._id);
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleAddResponse = async (reviewId) => {
    try {
      await axios.put(`${API_URL}/reviews/${reviewId}/response`, {
        message: responseText
      });
      toast.success('Response added successfully!');
      setRespondingTo(null);
      setResponseText('');
      fetchMyReviews();
    } catch (error) {
      toast.error('Failed to add response');
    }
  };

  const resetForm = () => {
    setFormData({
      doctor: '',
      rating: 5,
      professionalism: 5,
      communication: 5,
      punctuality: 5,
      thoroughness: 5,
      comment: '',
      isAnonymous: false
    });
  };

  const StarRating = ({ rating, onRate, readOnly = false }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${!readOnly && 'cursor-pointer hover:scale-110'} transition-all`}
            onClick={() => !readOnly && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 mb-2 flex items-center gap-3">
              <Award className="h-10 w-10 text-purple-600" />
              {user.role === 'doctor' ? 'My Reviews' : 'Doctor Reviews'}
            </h1>
            <p className="text-gray-600">
              {user.role === 'doctor' ? 'Reviews from your patients' : 'Rate and review doctors'}
            </p>
          </div>
          {user.role === 'patient' && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Star className="h-5 w-5" />
              Write Review
            </button>
          )}
        </div>

        {/* Doctor Selection for Patients */}
        {user.role === 'patient' && !selectedDoctor && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {doctors.map((doctor, index) => (
              <div
                key={doctor._id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all cursor-pointer animate-slide-up"
                style={{animationDelay: `${index * 0.05}s`}}
                onClick={() => fetchDoctorReviews(doctor._id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                    {doctor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Dr. {doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(doctor.doctorInfo?.averageRating || 0)} readOnly />
                  <span className="text-sm text-gray-600">
                    ({doctor.doctorInfo?.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics Dashboard for Doctors */}
        {user.role === 'doctor' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Award className="h-6 w-6" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{stats.averageRating?.toFixed(1) || 0}</span>
              </div>
              <p className="text-sm text-gray-600 font-semibold">Average Rating</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{stats.totalReviews}</span>
              </div>
              <p className="text-sm text-gray-600 font-semibold">Total Reviews</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{stats.categoryAverages?.communication?.toFixed(1) || 0}</span>
              </div>
              <p className="text-sm text-gray-600 font-semibold">Communication</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{stats.categoryAverages?.professionalism?.toFixed(1) || 0}</span>
              </div>
              <p className="text-sm text-gray-600 font-semibold">Professionalism</p>
            </div>
          </div>
        )}

        {/* Statistics for Selected Doctor (Patient View) */}
        {user.role === 'patient' && selectedDoctor && stats && (
          <div className="mb-8">
            <button
              onClick={() => {
                setSelectedDoctor(null);
                setReviews([]);
                setStats(null);
              }}
              className="mb-4 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all text-gray-700 font-semibold"
            >
              ← Back to Doctors
            </button>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-bold">
                  {selectedDoctor.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Dr. {selectedDoctor.name}</h2>
                  <p className="text-gray-600">{selectedDoctor.specialization}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={Math.round(stats.averageRating || 0)} readOnly />
                    <span className="text-lg font-semibold text-gray-700">
                      {stats.averageRating?.toFixed(1)} ({stats.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{stats.categoryAverages?.professionalism?.toFixed(1)}</p>
                  <p className="text-sm text-gray-600 font-medium">Professionalism</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{stats.categoryAverages?.communication?.toFixed(1)}</p>
                  <p className="text-sm text-gray-600 font-medium">Communication</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">{stats.categoryAverages?.punctuality?.toFixed(1)}</p>
                  <p className="text-sm text-gray-600 font-medium">Punctuality</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl">
                  <p className="text-2xl font-bold text-orange-600">{stats.categoryAverages?.thoroughness?.toFixed(1)}</p>
                  <p className="text-sm text-gray-600 font-medium">Thoroughness</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {(selectedDoctor || user.role === 'doctor') && (
          loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No reviews yet</h3>
              <p className="text-gray-600">Be the first to leave a review!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div
                  key={review._id}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all animate-slide-up"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg font-bold">
                        {review.isAnonymous ? '?' : review.patient?.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {review.isAnonymous ? 'Anonymous' : review.patient?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} readOnly />
                  </div>

                  {/* Category Ratings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">Professionalism</p>
                      <p className="text-lg font-bold text-blue-600">{review.professionalism}</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600">Communication</p>
                      <p className="text-lg font-bold text-purple-600">{review.communication}</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">Punctuality</p>
                      <p className="text-lg font-bold text-green-600">{review.punctuality}</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-600">Thoroughness</p>
                      <p className="text-lg font-bold text-orange-600">{review.thoroughness}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{review.comment}</p>

                  {/* Doctor Response */}
                  {review.doctorResponse && (
                    <div className="bg-blue-50 rounded-xl p-4 mb-4 border-l-4 border-blue-500">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Doctor's Response:</p>
                      <p className="text-gray-700">{review.doctorResponse.message}</p>
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(review.doctorResponse.respondedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleMarkHelpful(review._id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        review.helpful.includes(user._id)
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpful.length})
                    </button>

                    {user.role === 'doctor' && !review.doctorResponse && (
                      <button
                        onClick={() => setRespondingTo(review._id)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Respond
                      </button>
                    )}
                  </div>

                  {/* Response Form */}
                  {respondingTo === review._id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                        rows="3"
                        placeholder="Write your response..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseText('');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddResponse(review._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Send Response
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in my-8">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="h-6 w-6" />
                  Write a Review
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
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Doctor *
                </label>
                <select
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Overall Rating *
                </label>
                <StarRating
                  rating={formData.rating}
                  onRate={(rating) => setFormData({ ...formData, rating })}
                />
              </div>

              {/* Category Ratings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Professionalism
                  </label>
                  <StarRating
                    rating={formData.professionalism}
                    onRate={(rating) => setFormData({ ...formData, professionalism: rating })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Communication
                  </label>
                  <StarRating
                    rating={formData.communication}
                    onRate={(rating) => setFormData({ ...formData, communication: rating })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Punctuality
                  </label>
                  <StarRating
                    rating={formData.punctuality}
                    onRate={(rating) => setFormData({ ...formData, punctuality: rating })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thoroughness
                  </label>
                  <StarRating
                    rating={formData.thoroughness}
                    onRate={(rating) => setFormData({ ...formData, thoroughness: rating })}
                  />
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="4"
                  placeholder="Share your experience..."
                  required
                />
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="mr-2 h-5 w-5 text-purple-600"
                />
                <label className="text-sm text-gray-700 font-medium">Post anonymously</label>
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
