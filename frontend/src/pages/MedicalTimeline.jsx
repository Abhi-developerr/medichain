import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Clock, FileText, Pill, Calendar, Syringe, AlertTriangle, 
  Activity, Filter, Search, TrendingUp 
} from 'lucide-react';

const MedicalTimeline = () => {
  const { user } = useAuth();
  const [timeline, setTimeline] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetchTimeline();
    fetchStats();
  }, [filter, limit]);

  const fetchTimeline = async () => {
    try {
      const params = {
        limit,
        ...(filter !== 'all' && { type: filter })
      };
      const response = await api.get('/timeline', { params });
      setTimeline(response.data.timeline);
    } catch (error) {
      toast.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/timeline/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTimeline();
      return;
    }

    try {
      const response = await api.get('/timeline/search', {
        params: { query: searchQuery }
      });
      setTimeline(response.data.results.map(r => ({
        ...r,
        date: r.uploadDate || r.createdAt || r.dateAdministered || r.diagnosedDate || r.appointmentDate,
        title: r.reportName || r.vaccineName || `${r.type}`,
        type: r.type
      })));
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      FileText: <FileText className="w-5 h-5" />,
      Pill: <Pill className="w-5 h-5" />,
      Calendar: <Calendar className="w-5 h-5" />,
      Syringe: <Syringe className="w-5 h-5" />,
      AlertTriangle: <AlertTriangle className="w-5 h-5" />,
      Activity: <Activity className="w-5 h-5" />
    };
    return icons[iconName] || <FileText className="w-5 h-5" />;
  };

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-300',
      green: 'bg-green-100 text-green-600 border-green-300',
      purple: 'bg-purple-100 text-purple-600 border-purple-300',
      teal: 'bg-teal-100 text-teal-600 border-teal-300',
      red: 'bg-red-100 text-red-600 border-red-300',
      indigo: 'bg-indigo-100 text-indigo-600 border-indigo-300'
    };
    return colors[color] || 'bg-gray-100 text-gray-600 border-gray-300';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupByMonth = (items) => {
    const grouped = {};
    items.forEach(item => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!grouped[key]) {
        grouped[key] = { label, items: [] };
      }
      grouped[key].items.push(item);
    });
    return grouped;
  };

  const groupedTimeline = groupByMonth(timeline);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
          <Clock className="w-8 h-8" />
          Medical History Timeline
        </h1>
        <p className="text-gray-600">Complete chronological view of your medical records</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs mb-1">Reports</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalReports}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs mb-1">Prescriptions</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalPrescriptions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs mb-1">Appointments</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalAppointments}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs mb-1">Vaccinations</p>
            <p className="text-2xl font-bold text-teal-600">{stats.totalVaccinations}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs mb-1">Allergies</p>
            <p className="text-2xl font-bold text-red-600">{stats.activeAllergies}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-xs mb-1">Recent (30d)</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.recentActivity}</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter by Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              <option value="report">Reports</option>
              <option value="prescription">Prescriptions</option>
              <option value="appointment">Appointments</option>
              <option value="vaccination">Vaccinations</option>
              <option value="allergy">Allergies</option>
              <option value="health-metric">Health Metrics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items to Show
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="25">25 items</option>
              <option value="50">50 items</option>
              <option value="100">100 items</option>
              <option value="200">200 items</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search timeline..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedTimeline).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No timeline events found</p>
          </div>
        ) : (
          Object.entries(groupedTimeline).map(([key, group]) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">{group.label}</h2>
                <span className="text-sm text-gray-500">({group.items.length} events)</span>
              </div>
              
              <div className="relative border-l-2 border-gray-300 ml-3 space-y-6">
                {group.items.map((item, index) => (
                  <div key={index} className="relative pl-8 pb-6">
                    {/* Timeline dot */}
                    <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 ${getColorClass(item.color)} bg-white`} />
                    
                    {/* Event card */}
                    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${getColorClass(item.color)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${getColorClass(item.color)}`}>
                            {getIcon(item.icon)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{item.title}</h3>
                            {item.category && (
                              <p className="text-sm text-gray-600">{item.category}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 ml-12">{item.description}</p>
                      )}
                      
                      <div className="ml-12 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${getColorClass(item.color)}`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {timeline.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {timeline.length} events
        </div>
      )}
    </div>
  );
};

export default MedicalTimeline;
