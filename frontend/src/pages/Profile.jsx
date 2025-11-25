import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Briefcase, FileText, Lock, Edit2, Save, X, Camera, Shield, Activity } from 'lucide-react';

const Profile = () => {
  const { user, updateUser, API_URL } = useAuth();
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phoneNumber: user.phoneNumber || user.phone || '',
    address: user.address || '',
    specialization: user.doctorInfo?.specialization || user.specialization || '',
    licenseNumber: user.doctorInfo?.licenseNumber || user.licenseNumber || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error changing password');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post(`${API_URL}/auth/profile-picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser(response.data.user);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (user.profilePicture) {
      return `${API_URL}/reports/${user.profilePicture}/download`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100 animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-600" />
                  Profile Information
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your full address"
                    />
                  </div>

                  {user.role === 'doctor' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Specialization
                        </label>
                        <input
                          type="text"
                          value={formData.specialization}
                          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="e.g., Cardiologist, Pediatrician"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          License Number
                        </label>
                        <input
                          type="text"
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Medical License Number"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Save className="h-5 w-5" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({ 
                          name: user.name || '', 
                          phoneNumber: user.phoneNumber || user.phone || '', 
                          address: user.address || '',
                          specialization: user.doctorInfo?.specialization || user.specialization || '',
                          licenseNumber: user.doctorInfo?.licenseNumber || user.licenseNumber || ''
                        });
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <X className="h-5 w-5" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Full Name</p>
                      <p className="text-gray-900 font-semibold text-lg">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email Address</p>
                      <p className="text-gray-900 font-semibold">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Role</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'doctor' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Phone Number</p>
                      <p className="text-gray-900 font-semibold">{user.phoneNumber || user.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Address</p>
                      <p className="text-gray-900 font-semibold">{user.address || 'Not provided'}</p>
                    </div>
                  </div>

                  {user.role === 'doctor' && (
                    <>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <Briefcase className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Specialization</p>
                          <p className="text-gray-900 font-semibold">
                            {user.doctorInfo?.specialization || user.specialization || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600 font-medium">License Number</p>
                          <p className="text-gray-900 font-semibold">
                            {user.doctorInfo?.licenseNumber || user.licenseNumber || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      {user.doctorInfo?.verificationStatus && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Verification Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              user.doctorInfo.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              user.doctorInfo.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.doctorInfo.verificationStatus.charAt(0).toUpperCase() + user.doctorInfo.verificationStatus.slice(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Lock className="h-6 w-6 text-blue-600" />
                Change Password
              </h2>
              
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Lock className="h-5 w-5" />
                  Change Password
                </button>
              </form>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                Security & Activity
              </h2>
              
              <div className="space-y-4">
                <Link
                  to="/security/2fa"
                  className="block p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">
                          {user.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                        </p>
                      </div>
                    </div>
                    <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                  </div>
                </Link>

                <Link
                  to="/activity"
                  className="block p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Activity Log</h3>
                        <p className="text-sm text-gray-600">View your recent activity</p>
                      </div>
                    </div>
                    <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl border border-white/20 animate-scale-in sticky top-4">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border-4 border-white/30">
                  <User className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{user.name}</h3>
                <p className="text-white/80 text-sm">{user.email}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-white/70 text-xs mb-1">Account Type</p>
                  <p className="font-semibold text-lg capitalize">{user.role}</p>
                </div>

                {user.role === 'patient' && user.shareCode && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white/70 text-xs mb-1">Share Code</p>
                    <p className="font-mono font-bold text-xl tracking-wider">{user.shareCode}</p>
                  </div>
                )}

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-white/70 text-xs mb-1">Member Since</p>
                  <p className="font-semibold">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;