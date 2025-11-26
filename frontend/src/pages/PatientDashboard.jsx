import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FileText, Upload, Bell, Copy, CheckCircle, Clock, Sparkles, TrendingUp, Syringe, AlertTriangle, Users, History } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data } = await axios.get('/api/reports/my-reports');
      setReports(data.reports);
      
      setStats({
        total: data.reports.length,
        pending: data.reports.filter(r => r.status === 'pending').length,
        reviewed: data.reports.filter(r => r.status === 'reviewed').length
      });
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const copyShareCode = () => {
    navigator.clipboard.writeText(user.shareCode);
    toast.success('Share code copied!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Patient Dashboard</h1>
          <p className="text-gray-600 text-lg mt-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>!
          </p>
        </div>

        {/* Share Code Card */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 rounded-2xl p-8 text-white mb-8 shadow-2xl dark:shadow-[0_0_60px_rgba(59,130,246,0.4)] border border-white/20 dark:border-white/10 animate-scale-in relative overflow-hidden hover:shadow-[0_0_80px_rgba(147,51,234,0.5)] transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 dark:bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-6 w-6 animate-pulse" />
              Your Share Code
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-8 py-4 rounded-2xl border-2 border-white/50 dark:border-white/20 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">SHARE CODE</p>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 font-mono text-3xl font-bold tracking-wider animate-pulse">
                  {user?.shareCode}
                </div>
              </div>
              <button
                onClick={copyShareCode}
                className="px-6 py-3.5 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold border-2 border-white/30 dark:border-white/20 shadow-lg hover:scale-105 hover:shadow-2xl transform"
              >
                <Copy className="h-5 w-5" />
                Copy Code
              </button>
            </div>
            <p className="text-sm mt-4 opacity-90 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Share this code with doctors to give them access to your reports
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/80 p-6 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-blue-900/20 card-hover border border-blue-100 dark:border-blue-800/30 animate-scale-in transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Reports</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mt-2">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  All time
                </p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/80 p-6 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-yellow-900/20 card-hover border border-yellow-100 dark:border-yellow-800/30 animate-scale-in transition-all duration-300" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 dark:from-yellow-400 dark:to-yellow-300 bg-clip-text text-transparent mt-2">{stats.pending}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Under review</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/80 p-6 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-green-900/20 card-hover border border-green-100 dark:border-green-800/30 animate-scale-in transition-all duration-300" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Reviewed</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent mt-2">{stats.reviewed}</p>
                <p className="text-xs text-gray-500 mt-1">Completed</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/patient/upload"
            className="group bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/80 p-8 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-blue-900/20 hover:shadow-2xl dark:hover:shadow-blue-800/30 transition-all duration-300 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 transform hover:scale-105 animate-fade-in">
          >
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Upload className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">Upload Report</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Upload new medical documents securely</p>
          </Link>

          <Link
            to="/patient/reports"
            className="group bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/80 p-8 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-purple-900/20 hover:shadow-2xl dark:hover:shadow-purple-800/30 transition-all duration-300 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600 transform hover:scale-105 animate-fade-in" style={{animationDelay: '0.1s'}}>
          >
            <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">My Reports</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">View all your medical records</p>
          </Link>

          <Link
            to="/patient/reminders"
            className="group bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/80 p-8 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-pink-900/20 hover:shadow-2xl dark:hover:shadow-pink-800/30 transition-all duration-300 border-2 border-transparent hover:border-pink-300 dark:hover:border-pink-600 transform hover:scale-105 animate-fade-in" style={{animationDelay: '0.2s'}}>
          >
            <div className="h-14 w-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 transition-colors">Reminders</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Manage medicine reminders</p>
          </Link>
        </div>

        {/* New Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            Health Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/vaccinations"
              className="group bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/40 p-6 rounded-xl shadow hover:shadow-lg dark:hover:shadow-teal-800/30 transition-all border border-teal-200 dark:border-teal-700/50 hover:border-teal-400 dark:hover:border-teal-500 backdrop-blur-sm">
            >
              <Syringe className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Vaccinations</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Track immunization records</p>
            </Link>

            <Link
              to="/allergies"
              className="group bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 p-6 rounded-xl shadow hover:shadow-lg dark:hover:shadow-red-800/30 transition-all border border-red-200 dark:border-red-700/50 hover:border-red-400 dark:hover:border-red-500 backdrop-blur-sm">
            >
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Allergies</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Manage allergy information</p>
            </Link>

            <Link
              to="/family"
              className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 p-6 rounded-xl shadow hover:shadow-lg dark:hover:shadow-purple-800/30 transition-all border border-purple-200 dark:border-purple-700/50 hover:border-purple-400 dark:hover:border-purple-500 backdrop-blur-sm">
            >
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Family</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Family health records</p>
            </Link>

            <Link
              to="/timeline"
              className="group bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 p-6 rounded-xl shadow hover:shadow-lg dark:hover:shadow-indigo-800/30 transition-all border border-indigo-200 dark:border-indigo-700/50 hover:border-indigo-400 dark:hover:border-indigo-500 backdrop-blur-sm">
            >
              <History className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Timeline</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Medical history timeline</p>
            </Link>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/80 rounded-2xl shadow-lg dark:shadow-xl dark:shadow-gray-900/30 p-8 border border-gray-100 dark:border-gray-700/50 animate-slide-up transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            Recent Reports
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300 mt-4">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No reports uploaded yet. Upload your first report to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div key={report._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{report.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(report.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                    report.status === 'urgent' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}