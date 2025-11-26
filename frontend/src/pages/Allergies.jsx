import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AlertTriangle, Plus, Shield, Trash2, Edit2, AlertCircle } from 'lucide-react';

const Allergies = () => {
  const { user } = useAuth();
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    allergen: '',
    category: 'medication',
    severity: 'mild',
    reactions: '',
    diagnosedDate: '',
    notes: '',
    isActive: true
  });

  useEffect(() => {
    fetchAllergies();
  }, []);

  const fetchAllergies = async () => {
    try {
      const response = await api.get('/allergies');
      setAllergies(response.data.allergies);
    } catch (error) {
      toast.error('Failed to load allergies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        reactions: formData.reactions.split(',').map(r => r.trim()).filter(r => r)
      };

      if (editingId) {
        await api.put(`/allergies/${editingId}`, submitData);
        toast.success('Allergy updated successfully');
      } else {
        await api.post('/allergies', submitData);
        toast.success('Allergy added successfully');
      }
      resetForm();
      fetchAllergies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save allergy');
    }
  };

  const handleEdit = (allergy) => {
    setFormData({
      allergen: allergy.allergen,
      category: allergy.category,
      severity: allergy.severity,
      reactions: allergy.reactions.join(', '),
      diagnosedDate: allergy.diagnosedDate?.split('T')[0] || '',
      notes: allergy.notes || '',
      isActive: allergy.isActive
    });
    setEditingId(allergy._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this allergy record?')) return;
    try {
      await api.delete(`/allergies/${id}`);
      toast.success('Allergy deleted successfully');
      fetchAllergies();
    } catch (error) {
      toast.error('Failed to delete allergy');
    }
  };

  const recordReaction = async (id) => {
    const description = prompt('Please describe the allergic reaction:');
    if (!description) return;

    try {
      await api.post(`/allergies/${id}/reaction`, { description });
      toast.success('Reaction recorded successfully');
      fetchAllergies();
    } catch (error) {
      toast.error('Failed to record reaction');
    }
  };

  const resetForm = () => {
    setFormData({
      allergen: '',
      category: 'medication',
      severity: 'mild',
      reactions: '',
      diagnosedDate: '',
      notes: '',
      isActive: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      case 'life-threatening': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      medication: '💊',
      food: '🍽️',
      environmental: '🌿',
      other: '⚠️'
    };
    return icons[category] || '⚠️';
  };

  const criticalAllergies = allergies.filter(a => 
    (a.severity === 'severe' || a.severity === 'life-threatening') && a.isActive
  );

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
          <AlertTriangle className="w-8 h-8 text-red-500" />
          Allergy Management
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Allergy
        </button>
      </div>

      {/* Critical Allergies Alert */}
      {criticalAllergies.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Critical Allergies ({criticalAllergies.length})
              </h3>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                {criticalAllergies.map(allergy => (
                  <li key={allergy._id}>
                    <strong>{allergy.allergen}</strong> - {allergy.severity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Allergy' : 'Add New Allergy'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergen Name *
              </label>
              <input
                type="text"
                required
                value={formData.allergen}
                onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="medication">Medication</option>
                <option value="food">Food</option>
                <option value="environmental">Environmental</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity *
              </label>
              <select
                required
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="life-threatening">Life-Threatening</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosed Date
              </label>
              <input
                type="date"
                value={formData.diagnosedDate}
                onChange={(e) => setFormData({ ...formData, diagnosedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reactions (comma-separated)
              </label>
              <input
                type="text"
                value={formData.reactions}
                onChange={(e) => setFormData({ ...formData, reactions: e.target.value })}
                placeholder="e.g., rash, swelling, difficulty breathing"
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
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Currently Active</span>
              </label>
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
                {editingId ? 'Update' : 'Add'} Allergy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Allergies List */}
      <div className="grid gap-4">
        {allergies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No allergy records yet</p>
          </div>
        ) : (
          allergies.map((allergy) => (
            <div key={allergy._id} className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 ${allergy.isActive ? getSeverityColor(allergy.severity) : 'border-gray-300'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{getCategoryIcon(allergy.category)}</span>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {allergy.allergen}
                    </h3>
                    {!allergy.isActive && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 capitalize">{allergy.category}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(allergy.severity)}`}>
                  {allergy.severity}
                </span>
              </div>
              
              {allergy.reactions.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Reactions:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {allergy.reactions.map((reaction, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {reaction}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                {allergy.diagnosedDate && (
                  <div>
                    <span className="text-gray-600">Diagnosed:</span>
                    <span className="ml-2 font-medium">
                      {new Date(allergy.diagnosedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {allergy.lastReaction && (
                  <div>
                    <span className="text-gray-600">Last Reaction:</span>
                    <span className="ml-2 font-medium">
                      {new Date(allergy.lastReaction.date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {allergy.notes && (
                <p className="text-sm text-gray-600 mb-3 italic">{allergy.notes}</p>
              )}

              {allergy.lastReaction && (
                <div className="bg-red-50 p-3 rounded mb-3">
                  <p className="text-sm text-red-800">
                    <strong>Last Reaction:</strong> {allergy.lastReaction.description}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {allergy.isActive && (
                  <button
                    onClick={() => recordReaction(allergy._id)}
                    className="flex items-center gap-1 px-3 py-1 text-orange-600 hover:bg-orange-50 rounded-lg text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Record Reaction
                  </button>
                )}
                <button
                  onClick={() => handleEdit(allergy)}
                  className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(allergy._id)}
                  className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Allergies;
