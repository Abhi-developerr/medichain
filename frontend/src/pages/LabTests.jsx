import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FlaskConical, Plus, AlertTriangle, Calendar, FileText, Trash2, Edit, X } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LabTests() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [criticalTests, setCriticalTests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [formData, setFormData] = useState({
    testName: '',
    testType: 'blood',
    labName: '',
    testDate: '',
    doctorNotes: '',
    results: [{ parameter: '', value: '', unit: '', normalRange: '', status: 'normal' }]
  });

  useEffect(() => {
    loadTests();
    loadCriticalTests();
    loadStats();
  }, []);

  const loadTests = async () => {
    try {
      const { data } = await axios.get('/api/lab-tests');
      setTests(Array.isArray(data.tests) ? data.tests : []);
    } catch (error) {
      toast.error('Failed to load lab tests');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCriticalTests = async () => {
    try {
      const { data } = await axios.get('/api/lab-tests/critical');
      setCriticalTests(Array.isArray(data.tests) ? data.tests : []);
    } catch (error) {
      console.error('Failed to load critical tests');
      setCriticalTests([]);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await axios.get('/api/lab-tests/stats');
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/lab-tests', formData);
      toast.success('Lab test added successfully!');
      setShowModal(false);
      resetForm();
      loadTests();
      loadCriticalTests();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add test');
    }
  };

  const deleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      await axios.delete(`/api/lab-tests/${testId}`);
      toast.success('Test deleted successfully');
      loadTests();
      loadCriticalTests();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const resetForm = () => {
    setFormData({
      testName: '',
      testType: 'blood',
      labName: '',
      testDate: '',
      doctorNotes: '',
      results: [{ parameter: '', value: '', unit: '', normalRange: '', status: 'normal' }]
    });
  };

  const addResultRow = () => {
    setFormData({
      ...formData,
      results: [...formData.results, { parameter: '', value: '', unit: '', normalRange: '', status: 'normal' }]
    });
  };

  const removeResultRow = (index) => {
    setFormData({
      ...formData,
      results: formData.results.filter((_, i) => i !== index)
    });
  };

  const updateResultRow = (index, field, value) => {
    const newResults = [...formData.results];
    newResults[index][field] = value;
    setFormData({ ...formData, results: newResults });
  };

  const getStatusColor = (status) => {
    const colors = {
      normal: 'bg-green-100 text-green-700',
      low: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
      pending: 'bg-gray-100 text-gray-700',
      abnormal: 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getTestTypeIcon = (type) => {
    const icons = {
      blood: '🩸',
      urine: '🧪',
      imaging: '🔬',
      biopsy: '💉',
      genetic: '🧬',
      other: '📋'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Lab Test Results</h1>
          <p className="text-gray-600">Manage your laboratory test results and reports</p>
        </div>

        {/* Critical Alerts */}
        {criticalTests && criticalTests.length > 0 && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Test Results
            </div>
            <p className="text-red-600 text-sm">You have {criticalTests.length} test(s) with critical values. Please consult your doctor immediately.</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Total Tests</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Normal</p>
            <p className="text-3xl font-bold text-green-600">{stats.normal || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Abnormal</p>
            <p className="text-3xl font-bold text-orange-600">{stats.abnormal || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Critical</p>
            <p className="text-3xl font-bold text-red-600">{stats.critical || 0}</p>
          </div>
        </div>

        {/* Add Test Button */}
        <button
          onClick={() => setShowModal(true)}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Lab Test
        </button>

        {/* Tests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <FlaskConical className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No lab tests yet. Add your first test result!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tests.map((test) => (
              <div key={test._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getTestTypeIcon(test.testType)}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{test.testName}</h3>
                      <p className="text-sm text-gray-600">{test.labName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(test.overallStatus)}`}>
                      {test.overallStatus}
                    </span>
                    {test.criticalFlag && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Critical
                      </span>
                    )}
                    <button
                      onClick={() => deleteTest(test._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Calendar className="h-4 w-4" />
                  {new Date(test.testDate).toLocaleDateString()}
                </div>

                {/* Test Results Table */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Parameter</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Value</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Normal Range</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {test.results.map((result, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">{result.parameter}</td>
                          <td className="px-4 py-2 font-medium">{result.value} {result.unit}</td>
                          <td className="px-4 py-2 text-gray-600">{result.normalRange}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(result.status)}`}>
                              {result.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {test.doctorNotes && (
                  <div className="bg-blue-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 font-medium text-blue-900 mb-1">
                      <FileText className="h-4 w-4" />
                      Doctor's Notes
                    </div>
                    <p className="text-gray-700">{test.doctorNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Test Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add Lab Test</h2>
                <button onClick={() => { setShowModal(false); resetForm(); }}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Name</label>
                    <input
                      type="text"
                      required
                      value={formData.testName}
                      onChange={(e) => setFormData({...formData, testName: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="e.g., Complete Blood Count"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Type</label>
                    <select
                      value={formData.testType}
                      onChange={(e) => setFormData({...formData, testType: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="blood">Blood Test</option>
                      <option value="urine">Urine Test</option>
                      <option value="imaging">Imaging</option>
                      <option value="biopsy">Biopsy</option>
                      <option value="genetic">Genetic Test</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lab Name</label>
                    <input
                      type="text"
                      required
                      value={formData.labName}
                      onChange={(e) => setFormData({...formData, labName: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Date</label>
                    <input
                      type="date"
                      required
                      value={formData.testDate}
                      onChange={(e) => setFormData({...formData, testDate: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Doctor's Notes</label>
                  <textarea
                    value={formData.doctorNotes}
                    onChange={(e) => setFormData({...formData, doctorNotes: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="2"
                  ></textarea>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Test Results</label>
                    <button
                      type="button"
                      onClick={addResultRow}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Parameter
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.results.map((result, index) => (
                      <div key={index} className="grid grid-cols-6 gap-2 items-center bg-gray-50 p-2 rounded">
                        <input
                          type="text"
                          required
                          placeholder="Parameter"
                          value={result.parameter}
                          onChange={(e) => updateResultRow(index, 'parameter', e.target.value)}
                          className="col-span-2 px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Value"
                          value={result.value}
                          onChange={(e) => updateResultRow(index, 'value', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          value={result.unit}
                          onChange={(e) => updateResultRow(index, 'unit', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Range"
                          value={result.normalRange}
                          onChange={(e) => updateResultRow(index, 'normalRange', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <select
                          value={result.status}
                          onChange={(e) => updateResultRow(index, 'status', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="normal">Normal</option>
                          <option value="low">Low</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                        {formData.results.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeResultRow(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                  >
                    Add Test
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
