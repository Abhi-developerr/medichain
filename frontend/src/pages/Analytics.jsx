import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  BarChart3, TrendingUp, FileText, Activity, 
  Clock, CheckCircle, AlertTriangle, Calendar,
  PieChart, Filter, Download
} from 'lucide-react';

const Analytics = () => {
  const { API_URL, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reports/stats`);
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'prescription': 'from-blue-500 to-cyan-500',
      'lab-report': 'from-green-500 to-emerald-500',
      'scan': 'from-purple-500 to-pink-500',
      'x-ray': 'from-yellow-500 to-orange-500',
      'other': 'from-gray-500 to-gray-600'
    };
    return colors[type] || colors.other;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'from-yellow-500 to-orange-500',
      'reviewed': 'from-green-500 to-emerald-500',
      'urgent': 'from-red-500 to-pink-500',
      'resolved': 'from-blue-500 to-cyan-500'
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'from-green-500 to-emerald-500',
      'medium': 'from-blue-500 to-cyan-500',
      'high': 'from-orange-500 to-yellow-500',
      'urgent': 'from-red-500 to-pink-500'
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2 flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Comprehensive insights into your medical records</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-6 text-white animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-12 w-12 opacity-80" />
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="text-white/80 text-sm font-medium mb-1">Total Reports</p>
            <p className="text-4xl font-bold">{stats?.total || 0}</p>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-6 text-white animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-12 w-12 opacity-80" />
            </div>
            <p className="text-white/80 text-sm font-medium mb-1">Reviewed</p>
            <p className="text-4xl font-bold">
              {stats?.byStatus?.find(s => s._id === 'reviewed')?.count || 0}
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl shadow-xl p-6 text-white animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-12 w-12 opacity-80" />
            </div>
            <p className="text-white/80 text-sm font-medium mb-1">Pending</p>
            <p className="text-4xl font-bold">
              {stats?.byStatus?.find(s => s._id === 'pending')?.count || 0}
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-12 w-12 opacity-80" />
            </div>
            <p className="text-white/80 text-sm font-medium mb-1">Urgent</p>
            <p className="text-4xl font-bold">
              {stats?.byStatus?.find(s => s._id === 'urgent')?.count || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Report Types */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PieChart className="h-6 w-6 text-blue-600" />
              Reports by Type
            </h2>
            <div className="space-y-4">
              {stats?.byType?.map((item, index) => {
                const percentage = ((item.count / stats.total) * 100).toFixed(1);
                return (
                  <div key={item._id} className="animate-slide-up" style={{animationDelay: `${0.5 + index * 0.1}s`}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700 capitalize">
                        {item._id.replace('-', ' ')}
                      </span>
                      <span className="text-sm font-bold text-gray-600">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getTypeColor(item._id)} transition-all duration-1000 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-slide-up" style={{animationDelay: '0.5s'}}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-purple-600" />
              Status Distribution
            </h2>
            <div className="space-y-4">
              {stats?.byStatus?.map((item, index) => {
                const percentage = ((item.count / stats.total) * 100).toFixed(1);
                return (
                  <div key={item._id} className="animate-slide-up" style={{animationDelay: `${0.6 + index * 0.1}s`}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700 capitalize">{item._id}</span>
                      <span className="text-sm font-bold text-gray-600">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getStatusColor(item._id)} transition-all duration-1000 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        {stats?.byPriority && stats.byPriority.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-8 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              Priority Levels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.byPriority.map((item, index) => {
                const percentage = ((item.count / stats.total) * 100).toFixed(1);
                return (
                  <div key={item._id} className={`p-6 rounded-xl bg-gradient-to-r ${getPriorityColor(item._id)} text-white shadow-lg animate-scale-in`} style={{animationDelay: `${0.7 + index * 0.1}s`}}>
                    <p className="text-white/80 text-sm font-medium mb-2 capitalize">{item._id}</p>
                    <p className="text-3xl font-bold mb-1">{item.count}</p>
                    <p className="text-white/80 text-sm">{percentage}% of total</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-slide-up" style={{animationDelay: '0.7s'}}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-green-600" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {stats.recentActivity.map((report, index) => (
                <div key={report._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all animate-slide-up" style={{animationDelay: `${0.8 + index * 0.05}s`}}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${getTypeColor(report.reportType)} text-white`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{report.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {report.reportType.replace('-', ' ')} • {new Date(report.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    report.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                    report.status === 'urgent' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Trends */}
        {stats?.monthlyTrends && stats.monthlyTrends.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mt-8 animate-slide-up" style={{animationDelay: '0.8s'}}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              Upload Trends (Last 6 Months)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {stats.monthlyTrends.map((trend, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl animate-scale-in" style={{animationDelay: `${0.9 + index * 0.05}s`}}>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(trend._id.year, trend._id.month - 1).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">{trend.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
