import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Activity, Heart, Droplet, Weight, Thermometer, Wind, Plus, X, Save } from 'lucide-react';

const HealthMetrics = () => {
  const { API_URL } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [formData, setFormData] = useState({
    metricType: 'blood-pressure',
    value: '',
    unit: 'mmHg',
    systolic: '',
    diastolic: '',
    notes: '',
    isAbnormal: false
  });

  useEffect(() => {
    fetchMetrics();
  }, [selectedType]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const params = selectedType !== 'all' ? { metricType: selectedType } : {};
      const response = await axios.get(`${API_URL}/health-metrics`, { params });
      setMetrics(response.data.metrics);
    } catch (error) {
      toast.error('Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/health-metrics`, formData);
      toast.success('Health metric added successfully');
      fetchMetrics();
      resetForm();
    } catch (error) {
      toast.error('Failed to add metric');
    }
  };

  const resetForm = () => {
    setFormData({
      metricType: 'blood-pressure',
      value: '',
      unit: 'mmHg',
      systolic: '',
      diastolic: '',
      notes: '',
      isAbnormal: false
    });
    setShowModal(false);
  };

  const getMetricIcon = (type) => {
    const icons = {
      'blood-pressure': Heart,
      'blood-sugar': Droplet,
      'weight': Weight,
      'heart-rate': Activity,
      'temperature': Thermometer,
      'oxygen-level': Wind
    };
    return icons[type] || Activity;
  };

  const getMetricColor = (type) => {
    const colors = {
      'blood-pressure': 'from-red-500 to-pink-500',
      'blood-sugar': 'from-blue-500 to-cyan-500',
      'weight': 'from-green-500 to-emerald-500',
      'heart-rate': 'from-purple-500 to-violet-500',
      'temperature': 'from-orange-500 to-yellow-500',
      'oxygen-level': 'from-cyan-500 to-blue-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const metricTypes = [
    { value: 'blood-pressure', label: 'Blood Pressure', unit: 'mmHg' },
    { value: 'blood-sugar', label: 'Blood Sugar', unit: 'mg/dL' },
    { value: 'weight', label: 'Weight', unit: 'kg' },
    { value: 'heart-rate', label: 'Heart Rate', unit: 'bpm' },
    { value: 'temperature', label: 'Temperature', unit: '°F' },
    { value: 'oxygen-level', label: 'Oxygen Level', unit: '%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2 flex items-center gap-3">
              <Activity className="h-10 w-10 text-blue-600" />
              Health Metrics
            </h1>
            <p className="text-gray-600">Track your health measurements</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Metric
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedType === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {metricTypes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedType(value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedType === value
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Metrics List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : metrics.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No metrics recorded</h3>
            <p className="text-gray-600 mb-6">Start tracking your health data</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
            >
              Add First Metric
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, index) => {
              const Icon = getMetricIcon(metric.metricType);
              return (
                <div
                  key={metric._id}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all animate-slide-up"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${getMetricColor(metric.metricType)} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 capitalize">
                          {metric.metricType.replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(metric.recordedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {metric.isAbnormal && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        Abnormal
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    {metric.metricType === 'blood-pressure' && metric.systolic && metric.diastolic ? (
                      <p className="text-3xl font-bold text-gray-800">
                        {metric.systolic}/{metric.diastolic} <span className="text-lg text-gray-600">{metric.unit}</span>
                      </p>
                    ) : (
                      <p className="text-3xl font-bold text-gray-800">
                        {metric.value} <span className="text-lg text-gray-600">{metric.unit}</span>
                      </p>
                    )}
                  </div>

                  {metric.notes && (
                    <p className="text-sm text-gray-600 border-t border-gray-100 pt-3">{metric.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Add Health Metric</h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Metric Type</label>
                  <select
                    value={formData.metricType}
                    onChange={(e) => {
                      const type = metricTypes.find(t => t.value === e.target.value);
                      setFormData({ ...formData, metricType: e.target.value, unit: type?.unit || '' });
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {metricTypes.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {formData.metricType === 'blood-pressure' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Systolic</label>
                      <input
                        type="number"
                        value={formData.systolic}
                        onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Diastolic</label>
                      <input
                        type="number"
                        value={formData.diastolic}
                        onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Value ({formData.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAbnormal}
                    onChange={(e) => setFormData({ ...formData, isAbnormal: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700">Mark as abnormal</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" />
                    Save Metric
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthMetrics;
