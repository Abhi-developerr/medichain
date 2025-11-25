import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Activity, Calendar, FileText, Download, Clock, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ActivityLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/audit-logs/my-activity?page=${page}&limit=20`);
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const iconClass = "h-5 w-5";
    switch(action) {
      case 'CREATE': return <FileText className={iconClass + " text-green-600"} />;
      case 'UPDATE': return <FileText className={iconClass + " text-blue-600"} />;
      case 'DELETE': return <FileText className={iconClass + " text-red-600"} />;
      case 'LOGIN': return <User className={iconClass + " text-green-600"} />;
      case 'LOGOUT': return <User className={iconClass + " text-gray-600"} />;
      case 'ACCESS': return <FileText className={iconClass + " text-purple-600"} />;
      case 'DOWNLOAD': return <Download className={iconClass + " text-blue-600"} />;
      default: return <Activity className={iconClass + " text-gray-600"} />;
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      case 'LOGIN': return 'bg-green-100 text-green-700';
      case 'LOGOUT': return 'bg-gray-100 text-gray-700';
      case 'ACCESS': return 'bg-purple-100 text-purple-700';
      case 'DOWNLOAD': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />
      <main className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Activity className="h-8 w-8 text-blue-600" />
                My Activity
              </h1>
              <p className="text-gray-600 mt-2">View your recent activity and actions</p>
            </div>

            {/* Activity List */}
            <div className="glass-effect rounded-2xl p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading activity...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No activity found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all duration-300 border-2 border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className="text-sm text-gray-600">{log.resource}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {log.details?.method} {log.details?.path}
                          </p>
                          {log.ipAddress && (
                            <p className="text-xs text-gray-400 mt-1">IP: {log.ipAddress}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {formatDate(log.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
    </div>
  );
}
