import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Target, Plus, TrendingUp, Calendar, Award, Trash2, Play, Pause, CheckCircle2, X } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function HealthGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'fitness',
    description: '',
    targetValue: '',
    unit: '',
    targetDate: '',
    currentValue: 0
  });

  useEffect(() => {
    loadGoals();
    loadStats();
  }, []);

  const loadGoals = async () => {
    try {
      const { data } = await axios.get('/api/health-goals');
      setGoals(Array.isArray(data.goals) ? data.goals : []);
    } catch (error) {
      toast.error('Failed to load health goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await axios.get('/api/health-goals/stats');
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/health-goals', formData);
      toast.success('Health goal created successfully!');
      setShowModal(false);
      setFormData({ title: '', category: 'fitness', description: '', targetValue: '', unit: '', targetDate: '', currentValue: 0 });
      loadGoals();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create goal');
    }
  };

  const updateProgress = async (goalId, value, note = '') => {
    try {
      await axios.put(`/api/health-goals/${goalId}/progress`, { value, note });
      toast.success('Progress updated!');
      loadGoals();
      loadStats();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const updateStatus = async (goalId, status) => {
    try {
      await axios.put(`/api/health-goals/${goalId}/status`, { status });
      toast.success(`Goal ${status}!`);
      loadGoals();
      loadStats();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await axios.delete(`/api/health-goals/${goalId}`);
      toast.success('Goal deleted successfully');
      loadGoals();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      fitness: '🏃',
      nutrition: '🥗',
      'mental-health': '🧘',
      sleep: '😴',
      weight: '⚖️',
      medication: '💊',
      other: '🎯'
    };
    return icons[category] || '🎯';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      abandoned: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Health Goals</h1>
          <p className="text-gray-600">Track and achieve your health objectives</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Total Goals</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-purple-600">{stats.completed || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Paused</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.paused || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Abandoned</p>
            <p className="text-3xl font-bold text-gray-600">{stats.abandoned || 0}</p>
          </div>
        </div>

        {/* Add Goal Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Create New Goal
        </button>

        {/* Goals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No health goals yet. Create your first goal to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getCategoryIcon(goal.category)}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{goal.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">{goal.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold text-blue-600">{goal.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{goal.currentValue} {goal.unit}</span>
                    <span>{goal.targetValue} {goal.unit}</span>
                  </div>
                </div>

                {/* Target Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Calendar className="h-4 w-4" />
                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {goal.status === 'active' && (
                    <>
                      <button
                        onClick={() => {
                          const value = prompt(`Enter new ${goal.unit} value:`, goal.currentValue);
                          if (value) updateProgress(goal._id, parseFloat(value));
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
                      >
                        <TrendingUp className="h-4 w-4" />
                        Update
                      </button>
                      <button
                        onClick={() => updateStatus(goal._id, 'paused')}
                        className="px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(goal._id, 'completed')}
                        className="px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {goal.status === 'paused' && (
                    <button
                      onClick={() => updateStatus(goal._id, 'active')}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                    >
                      <Play className="h-4 w-4" />
                      Resume
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Goal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Create Health Goal</h2>
                <button onClick={() => setShowModal(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Run 5km daily"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="fitness">Fitness</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="mental-health">Mental Health</option>
                    <option value="sleep">Sleep</option>
                    <option value="weight">Weight</option>
                    <option value="medication">Medication</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Value</label>
                    <input
                      type="number"
                      required
                      value={formData.targetValue}
                      onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit</label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="e.g., km, kg, hours"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Target Date</label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
