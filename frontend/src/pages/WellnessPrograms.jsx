import { useState, useEffect } from 'react';
import { Trophy, Target, Utensils, Dumbbell, Brain, Moon, CheckCircle, Star, Flame, Award } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const WellnessPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [logData, setLogData] = useState({});

  const programTypes = [
    { value: 'fitness-challenge', label: 'Fitness Challenge', icon: <Dumbbell className="w-5 h-5" />, color: 'from-red-500 to-orange-500' },
    { value: 'nutrition-plan', label: 'Nutrition Plan', icon: <Utensils className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { value: 'meditation', label: 'Meditation Program', icon: <Brain className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { value: 'weight-loss', label: 'Weight Loss', icon: <Target className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { value: 'stress-management', label: 'Stress Management', icon: <Brain className="w-5 h-5" />, color: 'from-indigo-500 to-purple-500' },
    { value: 'sleep-improvement', label: 'Sleep Improvement', icon: <Moon className="w-5 h-5" />, color: 'from-violet-500 to-purple-500' },
    { value: 'custom', label: 'Custom Program', icon: <Star className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500' }
  ];

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/wellness-programs');
      setPrograms(Array.isArray(response.data.programs) ? response.data.programs : []);
    } catch (error) {
      toast.error('Failed to load programs');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (type) => {
    try {
      const typeLabel = programTypes.find(p => p.value === type)?.label || 'Wellness Program';
      const programData = {
        programType: type,
        name: typeLabel,
        description: `My ${typeLabel}`,
        startDate: new Date(),
        duration: 30, // 30 days default
        goals: [],
        dailyTasks: []
      };
      const response = await api.post('/wellness-programs', programData);
      toast.success('Program created!');
      setShowCreate(false);
      fetchPrograms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create program');
      console.error('Create program error:', error.response?.data);
    }
  };

  const handleLogMeal = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/wellness-programs/${selectedProgram._id}/meal`, logData);
      toast.success('Meal logged!');
      setLogData({});
      fetchProgramDetails(selectedProgram._id);
    } catch (error) {
      toast.error('Failed to log meal');
    }
  };

  const handleLogWorkout = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/wellness-programs/${selectedProgram._id}/workout`, logData);
      toast.success('Workout logged! +10 points 🎉');
      setLogData({});
      fetchProgramDetails(selectedProgram._id);
    } catch (error) {
      toast.error('Failed to log workout');
    }
  };

  const handleLogMeditation = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/wellness-programs/${selectedProgram._id}/meditation`, logData);
      toast.success('Meditation logged! +5 points 🧘');
      setLogData({});
      fetchProgramDetails(selectedProgram._id);
    } catch (error) {
      toast.error('Failed to log meditation');
    }
  };

  const handleLogSleep = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/wellness-programs/${selectedProgram._id}/sleep`, logData);
      toast.success('Sleep logged! +3 points 💤');
      setLogData({});
      fetchProgramDetails(selectedProgram._id);
    } catch (error) {
      toast.error('Failed to log sleep');
    }
  };

  const fetchProgramDetails = async (programId) => {
    try {
      const response = await api.get(`/wellness-programs/${programId}`);
      setSelectedProgram(response.data.program);
    } catch (error) {
      toast.error('Failed to load program details');
    }
  };

  const getProgramIcon = (type) => {
    return programTypes.find(p => p.value === type)?.icon || <Trophy className="w-5 h-5" />;
  };

  const getProgramColor = (type) => {
    return programTypes.find(p => p.value === type)?.color || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-orange-600" />
            Wellness Programs
          </h1>
          <p className="text-gray-600">Track your fitness, nutrition, and wellness journey with gamification</p>
        </div>

        {/* Create Program Button */}
        <button
          onClick={() => setShowCreate(true)}
          className="mb-6 px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-lg hover:from-orange-700 hover:to-pink-700 flex items-center gap-2"
        >
          <Target className="w-5 h-5" />
          Start New Program
        </button>

        {/* Programs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent mx-auto" />
          </div>
        ) : programs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No wellness programs yet. Start your journey!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program._id}
                onClick={() => {
                  setSelectedProgram(program);
                  setActiveTab('overview');
                }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getProgramColor(program.programType)} flex items-center justify-center text-white mb-4`}>
                  {getProgramIcon(program.programType)}
                </div>

                <h3 className="text-xl font-semibold mb-2 capitalize">
                  {program.programType.replace('-', ' ')}
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="font-semibold text-orange-600">
                      {program.progress?.completionRate || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getProgramColor(program.programType)}`}
                      style={{ width: `${program.progress?.completionRate || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-orange-600">
                    <Flame className="w-4 h-4" />
                    <span>{program.progress?.currentStreak || 0} day streak</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="w-4 h-4" />
                    <span>{program.progress?.totalPoints || 0} pts</span>
                  </div>
                </div>

                {program.progress?.badges?.length > 0 && (
                  <div className="mt-4 flex gap-1">
                    {program.progress.badges.slice(0, 5).map((badge, idx) => (
                      <div key={idx} className="text-2xl">{badge.icon || '🏆'}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Program Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Choose Your Wellness Program</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {programTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleCreateProgram(type.value)}
                    className={`p-6 rounded-xl bg-gradient-to-r ${type.color} text-white hover:shadow-xl transition-all text-left`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {type.icon}
                      <h3 className="font-semibold text-lg">{type.label}</h3>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="mt-6 w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Program Details Modal */}
        {selectedProgram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold capitalize mb-2">
                    {selectedProgram.programType.replace('-', ' ')}
                  </h2>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-600" />
                      {selectedProgram.progress?.currentStreak || 0} day streak
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-600" />
                      {selectedProgram.progress?.totalPoints || 0} points
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-purple-600" />
                      {selectedProgram.progress?.badges?.length || 0} badges
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b">
                {['overview', 'nutrition', 'fitness', 'mindfulness'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium capitalize ${
                      activeTab === tab
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {selectedProgram.progress?.completionRate || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Completion</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {selectedProgram.progress?.totalPoints || 0}
                      </div>
                      <div className="text-sm text-gray-600">Points</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {selectedProgram.progress?.longestStreak || 0}
                      </div>
                      <div className="text-sm text-gray-600">Best Streak</div>
                    </div>
                  </div>

                  {selectedProgram.progress?.badges?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Badges Earned</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedProgram.progress.badges.map((badge, idx) => (
                          <div key={idx} className="bg-yellow-50 rounded-lg p-3 text-center">
                            <div className="text-3xl mb-1">{badge.icon || '🏆'}</div>
                            <div className="text-xs font-medium">{badge.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div>
                  <h3 className="font-semibold mb-4">Log Meal</h3>
                  <form onSubmit={handleLogMeal} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Meal name"
                        value={logData.name || ''}
                        onChange={(e) => setLogData({ ...logData, name: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Calories"
                        value={logData.calories || ''}
                        onChange={(e) => setLogData({ ...logData, calories: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Protein (g)"
                        value={logData.protein || ''}
                        onChange={(e) => setLogData({ ...logData, protein: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Carbs (g)"
                        value={logData.carbs || ''}
                        onChange={(e) => setLogData({ ...logData, carbs: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Log Meal
                    </button>
                  </form>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Recent Meals</h4>
                    <div className="space-y-2">
                      {selectedProgram.nutritionPlan?.meals?.slice(-5).reverse().map((meal, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 flex justify-between">
                          <span>{meal.name}</span>
                          <span className="text-sm text-gray-600">{meal.calories} cal</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fitness' && (
                <div>
                  <h3 className="font-semibold mb-4">Log Workout</h3>
                  <form onSubmit={handleLogWorkout} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={logData.exercise || ''}
                        onChange={(e) => setLogData({ ...logData, exercise: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Duration (min)"
                        value={logData.duration || ''}
                        onChange={(e) => setLogData({ ...logData, duration: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Calories burned"
                        value={logData.caloriesBurned || ''}
                        onChange={(e) => setLogData({ ...logData, caloriesBurned: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <select
                        value={logData.intensity || 'moderate'}
                        onChange={(e) => setLogData({ ...logData, intensity: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                      >
                        <option value="low">Low Intensity</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High Intensity</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                    >
                      Log Workout (+10 points)
                    </button>
                  </form>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Recent Workouts</h4>
                    <div className="space-y-2">
                      {selectedProgram.workoutPlan?.workouts?.slice(-5).reverse().map((workout, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 flex justify-between">
                          <span>{workout.exercise}</span>
                          <span className="text-sm text-gray-600">{workout.duration} min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'mindfulness' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Log Meditation</h3>
                    <form onSubmit={handleLogMeditation} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          placeholder="Duration (min)"
                          value={logData.duration || ''}
                          onChange={(e) => setLogData({ ...logData, duration: e.target.value })}
                          className="px-4 py-2 border rounded-lg"
                          required
                        />
                        <select
                          value={logData.type || 'mindfulness'}
                          onChange={(e) => setLogData({ ...logData, type: e.target.value })}
                          className="px-4 py-2 border rounded-lg"
                        >
                          <option value="mindfulness">Mindfulness</option>
                          <option value="breathing">Breathing</option>
                          <option value="guided">Guided</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                      >
                        Log Meditation (+5 points)
                      </button>
                    </form>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Log Sleep</h3>
                    <form onSubmit={handleLogSleep} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          placeholder="Hours slept"
                          value={logData.hours || ''}
                          onChange={(e) => setLogData({ ...logData, hours: e.target.value })}
                          className="px-4 py-2 border rounded-lg"
                          required
                        />
                        <select
                          value={logData.quality || 'good'}
                          onChange={(e) => setLogData({ ...logData, quality: e.target.value })}
                          className="px-4 py-2 border rounded-lg"
                        >
                          <option value="poor">Poor</option>
                          <option value="fair">Fair</option>
                          <option value="good">Good</option>
                          <option value="excellent">Excellent</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                      >
                        Log Sleep (+3 points)
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessPrograms;
