import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, User, Heart, Calendar, Trash2, Edit2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FamilyAccounts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'child',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: '',
    phoneNumber: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    fetchFamilyMembers();
    fetchSummary();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const response = await api.get('/family');
      setFamilyMembers(response.data.familyMembers);
    } catch (error) {
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get('/family/summary');
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to load summary');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/family/${editingId}`, formData);
        toast.success('Family member updated successfully');
      } else {
        await api.post('/family', formData);
        toast.success('Family member added successfully');
      }
      resetForm();
      fetchFamilyMembers();
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save family member');
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth?.split('T')[0],
      gender: member.gender || 'male',
      bloodGroup: member.bloodGroup || '',
      phoneNumber: member.phoneNumber || '',
      email: member.email || '',
      notes: member.notes || ''
    });
    setEditingId(member._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this family member?')) return;
    try {
      await api.delete(`/family/${id}`);
      toast.success('Family member removed successfully');
      fetchFamilyMembers();
      fetchSummary();
    } catch (error) {
      toast.error('Failed to remove family member');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: 'child',
      dateOfBirth: '',
      gender: 'male',
      bloodGroup: '',
      phoneNumber: '',
      email: '',
      notes: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getRelationshipIcon = (relationship) => {
    const icons = {
      spouse: '💑',
      child: '👶',
      parent: '👨‍👩‍👦',
      sibling: '👫',
      grandparent: '👴',
      other: '👤'
    };
    return icons[relationship] || '👤';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-8 h-8" />
          Family Accounts
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Family Member
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Members</p>
                <p className="text-2xl font-bold text-gray-800">{summary.totalMembers}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Conditions</p>
                <p className="text-2xl font-bold text-orange-600">{summary.activeConditions}</p>
              </div>
              <Heart className="w-10 h-10 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Allergies</p>
                <p className="text-2xl font-bold text-red-600">{summary.totalAllergies}</p>
              </div>
              <Heart className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming Vaccinations</p>
                <p className="text-2xl font-bold text-green-600">{summary.upcomingVaccinations}</p>
              </div>
              <Calendar className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Family Member' : 'Add New Family Member'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship *
              </label>
              <select
                required
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="grandparent">Grandparent</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Family Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Family Members List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {familyMembers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No family members added yet</p>
          </div>
        ) : (
          familyMembers.map((member) => (
            <div key={member._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">{getRelationshipIcon(member.relationship)}</div>
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-gray-600 capitalize">{member.relationship}</p>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{calculateAge(member.dateOfBirth)} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium capitalize">{member.gender}</span>
                </div>
                {member.bloodGroup && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blood Group:</span>
                    <span className="font-medium">{member.bloodGroup}</span>
                  </div>
                )}
                {member.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{member.phoneNumber}</span>
                  </div>
                )}
              </div>

              {member.medicalConditions && member.medicalConditions.length > 0 && (
                <div className="mb-4 p-3 bg-orange-50 rounded">
                  <p className="text-xs text-orange-800 font-medium mb-1">Active Conditions:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.medicalConditions
                      .filter(c => c.status === 'active')
                      .slice(0, 3)
                      .map((condition, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                          {condition.condition}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member._id)}
                  className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FamilyAccounts;
