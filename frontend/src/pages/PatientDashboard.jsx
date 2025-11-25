import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FileText, Upload, Bell, Copy, CheckCircle, Clock, Sparkles, TrendingUp } from 'lucide-react';
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
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8 shadow-2xl border border-white/20 animate-scale-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Your Share Code
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-white/95 backdrop-blur-sm px-8 py-4 rounded-2xl border-2 border-white/50 shadow-xl">
                <p className="text-xs text-gray-600 mb-1 font-medium">SHARE CODE</p>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 font-mono text-3xl font-bold tracking-wider">
                  {user?.shareCode}
                </div>
              </div>
              <button
                onClick={copyShareCode}
                className="px-6 py-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold border-2 border-white/30 shadow-lg hover:scale-105 transform"
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
          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover border border-blue-100 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Reports</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mt-2">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  All time
                </p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover border border-yellow-100 animate-scale-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent mt-2">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Under review</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover border border-green-100 animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Reviewed</p>
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
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 transform hover:scale-105 animate-fade-in"
          >
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Upload className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Upload Report</h3>
            <p className="text-gray-600 text-sm">Upload new medical documents securely</p>
          </Link>

          <Link
            to="/patient/reports"
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 transform hover:scale-105 animate-fade-in" style={{animationDelay: '0.1s'}}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">My Reports</h3>
            <p className="text-gray-600 text-sm">View all your medical records</p>
          </Link>

          <Link
            to="/patient/reminders"
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-300 transform hover:scale-105 animate-fade-in" style={{animationDelay: '0.2s'}}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">Reminders</h3>
            <p className="text-gray-600 text-sm">Manage medicine reminders</p>
          </Link>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            Recent Reports
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reports uploaded yet. Upload your first report to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div key={report._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">{report.title}</p>
                      <p className="text-sm text-gray-500">
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