import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, Plus, DollarSign, Calendar, Users, FileText, Trash2, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Insurance() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [formData, setFormData] = useState({
    policyNumber: '',
    provider: '',
    policyType: 'individual',
    coverageAmount: '',
    premium: '',
    startDate: '',
    endDate: '',
    dependents: []
  });
  const [claimData, setClaimData] = useState({
    claimId: '',
    date: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    loadPolicies();
    loadStats();
  }, []);

  const loadPolicies = async () => {
    try {
      const { data } = await axios.get('/api/insurance');
      setPolicies(Array.isArray(data.policies) ? data.policies : []);
    } catch (error) {
      toast.error('Failed to load insurance policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await axios.get('/api/insurance/stats');
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/insurance', formData);
      toast.success('Insurance policy added successfully!');
      setShowPolicyModal(false);
      resetPolicyForm();
      loadPolicies();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add policy');
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/insurance/${selectedPolicy._id}/claims`, claimData);
      toast.success('Claim submitted successfully!');
      setShowClaimModal(false);
      setClaimData({ claimId: '', date: '', amount: '', description: '' });
      setSelectedPolicy(null);
      loadPolicies();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit claim');
    }
  };

  const updateClaimStatus = async (policyId, claimId, status, approvedAmount = null) => {
    try {
      await axios.put(`/api/insurance/${policyId}/claims/status`, { claimId, status, approvedAmount });
      toast.success(`Claim ${status}!`);
      loadPolicies();
      loadStats();
    } catch (error) {
      toast.error('Failed to update claim status');
    }
  };

  const deletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      await axios.delete(`/api/insurance/${policyId}`);
      toast.success('Policy deleted successfully');
      loadPolicies();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  const resetPolicyForm = () => {
    setFormData({
      policyNumber: '',
      provider: '',
      policyType: 'individual',
      coverageAmount: '',
      premium: '',
      startDate: '',
      endDate: '',
      dependents: []
    });
  };

  const addDependent = () => {
    setFormData({
      ...formData,
      dependents: [...formData.dependents, { name: '', relationship: '', dateOfBirth: '' }]
    });
  };

  const removeDependent = (index) => {
    setFormData({
      ...formData,
      dependents: formData.dependents.filter((_, i) => i !== index)
    });
  };

  const updateDependent = (index, field, value) => {
    const newDependents = [...formData.dependents];
    newDependents[index][field] = value;
    setFormData({ ...formData, dependents: newDependents });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      expired: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getClaimStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-700',
      processing: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getClaimIcon = (status) => {
    const icons = {
      submitted: <Clock className="h-4 w-4" />,
      processing: <Clock className="h-4 w-4" />,
      approved: <CheckCircle className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Insurance Management</h1>
          <p className="text-gray-600">Manage your health insurance policies and claims</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Active Policies</p>
            <p className="text-3xl font-bold text-green-600">{stats.activePolicies || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Total Coverage</p>
            <p className="text-3xl font-bold text-blue-600">${(stats.totalCoverage || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Claims Submitted</p>
            <p className="text-3xl font-bold text-purple-600">{stats.totalClaims || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Approved Claims</p>
            <p className="text-3xl font-bold text-green-600">{stats.approvedClaims || 0}</p>
          </div>
        </div>

        {/* Add Policy Button */}
        <button
          onClick={() => setShowPolicyModal(true)}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Insurance Policy
        </button>

        {/* Policies List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No insurance policies yet. Add your first policy!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {policies.map((policy) => (
              <div key={policy._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl">{policy.provider}</h3>
                      <p className="text-sm text-gray-600">Policy #{policy.policyNumber}</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePolicy(policy._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Policy Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Policy Type</p>
                    <p className="font-medium capitalize">{policy.policyType.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Coverage Amount</p>
                    <p className="font-medium text-blue-600">${policy.coverageAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Remaining Coverage</p>
                    <p className="font-medium text-green-600">${policy.remainingCoverage.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Monthly Premium</p>
                    <p className="font-medium">${policy.premium.toLocaleString()}</p>
                  </div>
                </div>

                {/* Validity Period */}
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Valid from {new Date(policy.startDate).toLocaleDateString()}</span>
                  </div>
                  <span>→</span>
                  <span>to {new Date(policy.endDate).toLocaleDateString()}</span>
                </div>

                {/* Dependents */}
                {policy.dependents && policy.dependents.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Users className="h-4 w-4" />
                      Dependents ({policy.dependents.length})
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {policy.dependents.map((dep, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded-lg text-sm">
                          <p className="font-medium">{dep.name}</p>
                          <p className="text-xs text-gray-600">{dep.relationship}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Claims Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FileText className="h-4 w-4" />
                      Claims ({policy.claims?.length || 0})
                    </div>
                    <button
                      onClick={() => { setSelectedPolicy(policy); setShowClaimModal(true); }}
                      className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      Submit Claim
                    </button>
                  </div>

                  {policy.claims && policy.claims.length > 0 && (
                    <div className="space-y-2">
                      {policy.claims.map((claim, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">Claim #{claim.claimId}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getClaimStatusColor(claim.status)}`}>
                                {getClaimIcon(claim.status)}
                                {claim.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{claim.description}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>{new Date(claim.date).toLocaleDateString()}</span>
                              <span>Claimed: ${claim.amount.toLocaleString()}</span>
                              {claim.approvedAmount !== null && (
                                <span className="text-green-600">Approved: ${claim.approvedAmount.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          {user?.role === 'admin' && claim.status === 'submitted' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const amount = prompt('Enter approved amount:', claim.amount);
                                  if (amount) updateClaimStatus(policy._id, claim.claimId, 'approved', parseFloat(amount));
                                }}
                                className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateClaimStatus(policy._id, claim.claimId, 'rejected')}
                                className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Policy Modal */}
        {showPolicyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add Insurance Policy</h2>
                <button onClick={() => { setShowPolicyModal(false); resetPolicyForm(); }}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handlePolicySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Policy Number</label>
                    <input
                      type="text"
                      required
                      value={formData.policyNumber}
                      onChange={(e) => setFormData({...formData, policyNumber: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Provider</label>
                    <input
                      type="text"
                      required
                      value={formData.provider}
                      onChange={(e) => setFormData({...formData, provider: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Policy Type</label>
                    <select
                      value={formData.policyType}
                      onChange={(e) => setFormData({...formData, policyType: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="individual">Individual</option>
                      <option value="family">Family</option>
                      <option value="group">Group</option>
                      <option value="senior-citizen">Senior Citizen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Coverage Amount ($)</label>
                    <input
                      type="number"
                      required
                      value={formData.coverageAmount}
                      onChange={(e) => setFormData({...formData, coverageAmount: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Premium ($)</label>
                    <input
                      type="number"
                      required
                      value={formData.premium}
                      onChange={(e) => setFormData({...formData, premium: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Dependents</label>
                    <button
                      type="button"
                      onClick={addDependent}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Dependent
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.dependents.map((dep, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-center bg-gray-50 p-2 rounded">
                        <input
                          type="text"
                          required
                          placeholder="Name"
                          value={dep.name}
                          onChange={(e) => updateDependent(index, 'name', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Relationship"
                          value={dep.relationship}
                          onChange={(e) => updateDependent(index, 'relationship', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <input
                          type="date"
                          required
                          value={dep.dateOfBirth}
                          onChange={(e) => updateDependent(index, 'dateOfBirth', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeDependent(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowPolicyModal(false); resetPolicyForm(); }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                  >
                    Add Policy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Submit Claim Modal */}
        {showClaimModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Submit Claim</h2>
                <button onClick={() => { setShowClaimModal(false); setClaimData({ claimId: '', date: '', amount: '', description: '' }); }}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Claim ID</label>
                  <input
                    type="text"
                    required
                    value={claimData.claimId}
                    onChange={(e) => setClaimData({...claimData, claimId: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., CLM-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Claim Date</label>
                  <input
                    type="date"
                    required
                    value={claimData.date}
                    onChange={(e) => setClaimData({...claimData, date: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Claim Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={claimData.amount}
                    onChange={(e) => setClaimData({...claimData, amount: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    required
                    value={claimData.description}
                    onChange={(e) => setClaimData({...claimData, description: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                    placeholder="Describe the medical expense..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowClaimModal(false); setClaimData({ claimId: '', date: '', amount: '', description: '' }); }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                  >
                    Submit Claim
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
