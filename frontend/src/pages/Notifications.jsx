import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Bell, BellOff, Check, CheckCheck, Trash2, FileText, User, AlertCircle, Clock } from 'lucide-react';

const Notifications = () => {
  const { API_URL } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [stats, setStats] = useState({ total: 0, unreadCount: 0 });

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/notifications`, {
        params: { unreadOnly: filter === 'unread' }
      });
      setNotifications(response.data.notifications);
      setStats({
        total: response.data.total,
        unreadCount: response.data.unreadCount
      });
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`);
      fetchNotifications();
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`);
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/notifications/${id}`);
      fetchNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'report_uploaded':
      case 'report_viewed':
        return <FileText className="h-5 w-5" />;
      case 'report_note_added':
        return <AlertCircle className="h-5 w-5" />;
      case 'access_granted':
      case 'access_revoked':
        return <User className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'report_uploaded':
        return 'from-blue-500 to-cyan-500';
      case 'report_viewed':
        return 'from-purple-500 to-pink-500';
      case 'report_note_added':
        return 'from-orange-500 to-red-500';
      case 'access_granted':
        return 'from-green-500 to-emerald-500';
      case 'access_revoked':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = Math.floor((now - notifDate) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2 flex items-center gap-3">
            <Bell className="h-10 w-10 text-blue-600" />
            Notifications
          </h1>
          <p className="text-gray-600">Stay updated with your medical records</p>
        </div>

        {/* Stats and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Bell className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 font-medium">Unread</p>
                <p className="text-3xl font-bold">{stats.unreadCount}</p>
              </div>
              <BellOff className="h-12 w-12 text-white opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 flex items-center justify-center gap-2">
            <button
              onClick={markAllAsRead}
              disabled={stats.unreadCount === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread ({stats.unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-xl shadow-lg p-6 border-l-4 transition-all hover:shadow-xl ${
                  notification.isRead ? 'border-gray-300 opacity-75' : 'border-blue-500'
                } animate-slide-up`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${getNotificationColor(notification.type)} text-white shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {notification.title}
                        {!notification.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                        <Clock className="h-4 w-4" />
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{notification.message}</p>

                    {notification.relatedUser && (
                      <p className="text-sm text-gray-500 mb-3">
                        Related to: <span className="font-semibold">{notification.relatedUser.name}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-semibold text-sm flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-sm flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
