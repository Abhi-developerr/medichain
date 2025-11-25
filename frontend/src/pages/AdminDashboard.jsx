import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, UserCheck, UserX, FileText, Activity, Trash2, Search } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalReports: 0,
    recentUsers: []
  });
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, doctorsRes, usersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/pending-doctors'),
        axios.get('/api/admin/users')
      ]);
      
      setStats(statsRes.data.stats);
      setPendingDoctors(doctorsRes.data.doctors);
      setAllUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (id) => {
    try {
      await axios.put(`/api/admin/verify-doctor/${id}`);
      toast.success('Doctor verified successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to verify doctor');
    }
  };

  const handleRejectDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to reject this doctor?')) return;
    
    try {
      await axios.put(`/api/admin/reject-doctor/${id}`);
      toast.success('Doctor rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject doctor');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`/api/admin/user/${id}`);
      toast.success('User deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    try {
      await axios.put(`/api/admin/user-role/${id}`, { role: newRole });
      toast.success('User role updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 text-lg">Manage users and monitor system activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover border border-blue-100 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mt-2">{stats.totalUsers}</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover border border-green-100 animate-scale-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Patients</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent mt-2">{stats.totalPatients}</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCheck className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover border border-purple-100 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Doctors</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mt-2">{stats.totalDoctors}</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover border border-yellow-100 animate-scale-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent mt-2">{stats.pendingDoctors}</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserX className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover border border-indigo-100 animate-scale-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Reports</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent mt-2">{stats.totalReports}</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Doctor Verifications */}
        {pendingDoctors.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-yellow-100 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <UserX className="h-5 w-5 text-white" />
              </div>
              Pending Doctor Verifications
              <span className="ml-auto text-sm font-normal bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">{pendingDoctors.length} pending</span>
            </h2>
            <div className="space-y-4">
              {pendingDoctors.map((doctor, index) => (
                <div key={doctor._id} className="flex items-center justify-between p-5 border-2 border-gray-100 rounded-xl hover:border-yellow-200 hover:shadow-md transition-all duration-300 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{doctor.email}</p>
                    <div className="mt-3 flex gap-6 text-sm">
                      <span className="text-gray-700 flex items-center gap-2">
                        <span className="font-semibold text-purple-600">Specialization:</span> {doctor.specialization}
                      </span>
                      <span className="text-gray-700 flex items-center gap-2">
                        <span className="font-semibold text-blue-600">License:</span> {doctor.licenseNumber}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVerifyDoctor(doctor._id)}
                      className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      ✓ Verify
                    </button>
                    <button
                      onClick={() => handleRejectDoctor(doctor._id)}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Users Management */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              Manage All Users
            </h2>
            <div className="flex gap-4">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 w-64 hover:border-gray-300"
                />
              </div>
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-gray-300 font-medium"
              >
                <option value="">All Roles</option>
                <option value="patient">👤 Patient</option>
                <option value="doctor">👨‍⚕️ Doctor</option>
                <option value="admin">🔧 Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-12 w-12 text-gray-300" />
                        <p className="text-lg font-medium">No users found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user._id} className="hover:bg-blue-50 transition-colors duration-200 animate-fade-in" style={{animationDelay: `${index * 0.05}s`}}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">{user.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                            {user.role === 'doctor' && user.specialization && (
                              <div className="text-xs text-purple-600 font-medium">{user.specialization}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200' :
                            user.role === 'doctor' ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200' :
                            'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                          }`}
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-2 w-fit ${
                          user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <span className={`h-2 w-2 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></span>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                          title="Delete User"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
            <div className="text-sm font-semibold text-gray-700">
              Showing <span className="text-blue-600">{filteredUsers.length}</span> of <span className="text-purple-600">{allUsers.length}</span> users
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Data
            </div>
          </div>
        </div>

        {/* Recent Users - Keep for reference but can be hidden or removed */}
        {stats.recentUsers && stats.recentUsers.length > 0 && false && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
