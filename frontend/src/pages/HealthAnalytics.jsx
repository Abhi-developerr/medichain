import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

function HealthAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    generateAnalytics();
  }, [period]);

  const generateAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'daily':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'yearly':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const response = await api.post('/health-analytics', {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      setAnalytics(response.data.analytics);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate analytics');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Health Scores */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {analytics?.healthScores && Object.entries(analytics.healthScores).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow p-4 text-center">
            <h3 className="text-sm font-medium text-gray-600 capitalize mb-2">{key}</h3>
            <div className={`text-3xl font-bold ${
              value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {value}
            </div>
            <p className="text-xs text-gray-500 mt-1">out of 100</p>
          </div>
        ))}
      </div>

      {/* Insights */}
      {analytics?.insights?.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">AI Insights</h3>
          <div className="space-y-3">
            {analytics.insights.map((insight, idx) => (
              <div key={idx} className={`border-l-4 rounded-lg p-4 ${
                insight.category === 'warning' ? 'border-red-500 bg-red-50' :
                insight.category === 'recommendation' ? 'border-blue-500 bg-blue-50' :
                insight.category === 'achievement' ? 'border-green-500 bg-green-50' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                    {insight.actions && (
                      <ul className="list-disc list-inside mt-2 text-sm">
                        {insight.actions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    insight.priority === 'high' ? 'bg-red-200 text-red-800' :
                    insight.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {insight.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessments */}
      {analytics?.riskAssessments?.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Risk Assessments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.riskAssessments.map((risk, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{risk.condition}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    risk.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                    risk.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {risk.riskLevel} risk
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Factors:</strong> {risk.factors.join(', ')}
                </p>
                <div className="text-sm">
                  <strong>Recommendations:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {risk.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderVitals = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Vital Signs Trends</h3>

      {/* Blood Pressure */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Blood Pressure</h4>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Average</p>
            <p className="text-lg font-bold">
              {analytics?.vitalsAnalytics?.bloodPressure?.averageSystolic}/
              {analytics?.vitalsAnalytics?.bloodPressure?.averageDiastolic}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Trend</p>
            <p className={`text-lg font-bold capitalize ${
              analytics?.vitalsAnalytics?.bloodPressure?.trend === 'improving' ? 'text-green-600' :
              analytics?.vitalsAnalytics?.bloodPressure?.trend === 'worsening' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {analytics?.vitalsAnalytics?.bloodPressure?.trend}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Highest</p>
            <p className="text-lg font-bold">
              {analytics?.vitalsAnalytics?.bloodPressure?.highest?.systolic}/
              {analytics?.vitalsAnalytics?.bloodPressure?.highest?.diastolic}
            </p>
          </div>
        </div>
      </div>

      {/* Heart Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Heart Rate</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Average</p>
            <p className="text-2xl font-bold">
              {analytics?.vitalsAnalytics?.heartRate?.average} bpm
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Resting</p>
            <p className="text-2xl font-bold">
              {analytics?.vitalsAnalytics?.heartRate?.restingAverage} bpm
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Range</p>
            <p className="text-lg font-bold">
              {analytics?.vitalsAnalytics?.heartRate?.lowest}-
              {analytics?.vitalsAnalytics?.heartRate?.highest}
            </p>
          </div>
        </div>
      </div>

      {/* Weight & BMI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Weight</h4>
          <div className="text-center">
            <p className="text-3xl font-bold">{analytics?.vitalsAnalytics?.weight?.current} kg</p>
            <p className={`text-sm mt-2 ${
              analytics?.vitalsAnalytics?.weight?.change < 0 ? 'text-green-600' :
              analytics?.vitalsAnalytics?.weight?.change > 0 ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {analytics?.vitalsAnalytics?.weight?.change > 0 ? '+' : ''}
              {analytics?.vitalsAnalytics?.weight?.change} kg (
              {analytics?.vitalsAnalytics?.weight?.changePercentage}%)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">BMI</h4>
          <div className="text-center">
            <p className="text-3xl font-bold">{analytics?.vitalsAnalytics?.BMI?.current}</p>
            <p className={`text-sm mt-2 capitalize ${
              analytics?.vitalsAnalytics?.BMI?.category === 'normal' ? 'text-green-600' :
              'text-yellow-600'
            }`}>
              {analytics?.vitalsAnalytics?.BMI?.category}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Activity & Exercise</h3>

      {/* Steps */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Steps</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{analytics?.activityAnalytics?.steps?.total?.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Daily Average</p>
            <p className="text-2xl font-bold">{analytics?.activityAnalytics?.steps?.dailyAverage?.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Goal Achievement</p>
            <p className="text-2xl font-bold text-green-600">
              {analytics?.activityAnalytics?.steps?.goalAchievement}%
            </p>
          </div>
        </div>
      </div>

      {/* Exercise */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Exercise Summary</h4>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Minutes</p>
            <p className="text-2xl font-bold">{analytics?.activityAnalytics?.exercise?.totalMinutes}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Sessions</p>
            <p className="text-2xl font-bold">{analytics?.activityAnalytics?.exercise?.sessions}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Duration</p>
            <p className="text-2xl font-bold">{analytics?.activityAnalytics?.exercise?.averageDuration} min</p>
          </div>
        </div>

        {analytics?.activityAnalytics?.exercise?.byType && (
          <div>
            <p className="text-sm font-medium mb-2">By Type</p>
            <div className="space-y-2">
              {analytics.activityAnalytics.exercise.byType.map((type, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm">{type.type}</span>
                  <span className="text-sm font-semibold">{type.minutes} min</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sleep */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Sleep Quality</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Average Hours</p>
            <p className="text-2xl font-bold">{analytics?.activityAnalytics?.sleep?.averageHours}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Quality Score</p>
            <p className={`text-2xl font-bold ${
              analytics?.activityAnalytics?.sleep?.qualityScore >= 80 ? 'text-green-600' :
              analytics?.activityAnalytics?.sleep?.qualityScore >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {analytics?.activityAnalytics?.sleep?.qualityScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* Medication Adherence */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Medication Adherence</h4>
        <div className="text-center mb-4">
          <p className="text-4xl font-bold text-blue-600">
            {analytics?.medicationAdherence?.overall}%
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {analytics?.medicationAdherence?.missedDoses} missed doses out of {analytics?.medicationAdherence?.totalDoses}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Health Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Last 24 Hours</option>
          <option value="weekly">Last Week</option>
          <option value="monthly">Last Month</option>
          <option value="yearly">Last Year</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {['overview', 'vitals', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'vitals' && renderVitals()}
        {activeTab === 'activity' && renderActivity()}
      </div>
    </div>
  );
}

export default HealthAnalytics;
