import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Syringe, Plus, Calendar, AlertCircle, Trash2, Edit2, FileDown } from 'lucide-react';

const Vaccinations = () => {
  const { user } = useAuth();
  const [vaccinations, setVaccinations] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    vaccineName: '',
    diseaseTarget: '',
    manufacturer: '',
    batchNumber: '',
    dateAdministered: '',
    nextDueDate: '',
    location: '',
    doseNumber: 1,
    totalDoses: 1,
    sideEffects: '',
    notes: ''
  });

  useEffect(() => {
    fetchVaccinations();
    fetchUpcoming();
  }, []);

  const fetchVaccinations = async () => {
    try {
      const response = await api.get('/vaccinations');
      setVaccinations(response.data.vaccinations);
    } catch (error) {
      toast.error('Failed to load vaccinations');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const response = await api.get('/vaccinations/upcoming');
      setUpcoming(response.data.vaccinations);
    } catch (error) {
      console.error('Failed to load upcoming vaccinations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/vaccinations/${editingId}`, formData);
        toast.success('Vaccination updated successfully');
      } else {
        await api.post('/vaccinations', formData);
        toast.success('Vaccination added successfully');
      }
      resetForm();
      fetchVaccinations();
      fetchUpcoming();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save vaccination');
    }
  };

  const handleEdit = (vaccination) => {
    setFormData({
      vaccineName: vaccination.vaccineName,
      diseaseTarget: vaccination.diseaseTarget,
      manufacturer: vaccination.manufacturer || '',
      batchNumber: vaccination.batchNumber || '',
      dateAdministered: vaccination.dateAdministered?.split('T')[0],
      nextDueDate: vaccination.nextDueDate?.split('T')[0] || '',
      location: vaccination.location || '',
      doseNumber: vaccination.doseNumber,
      totalDoses: vaccination.totalDoses,
      sideEffects: vaccination.sideEffects || '',
      notes: vaccination.notes || ''
    });
    setEditingId(vaccination._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vaccination record?')) return;
    try {
      await api.delete(`/vaccinations/${id}`);
      toast.success('Vaccination deleted successfully');
      fetchVaccinations();
      fetchUpcoming();
    } catch (error) {
      toast.error('Failed to delete vaccination');
    }
  };

  const resetForm = () => {
    setFormData({
      vaccineName: '',
      diseaseTarget: '',
      manufacturer: '',
      batchNumber: '',
      dateAdministered: '',
      nextDueDate: '',
      location: '',
      doseNumber: 1,
      totalDoses: 1,
      sideEffects: '',
      notes: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <Syringe className="w-8 h-8" />
          Vaccination Records
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Vaccination
        </button>
      </div>

      {/* Upcoming Vaccinations Alert */}
      {upcoming.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              You have {upcoming.length} upcoming or overdue vaccination{upcoming.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Vaccination' : 'Add New Vaccination'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccine Name *
              </label>
              <input
                type="text"
                required
                value={formData.vaccineName}
                onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disease Target *
              </label>
              <input
                type="text"
                required
                value={formData.diseaseTarget}
                onChange={(e) => setFormData({ ...formData, diseaseTarget: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Administered *
              </label>
              <input
                type="date"
                required
                value={formData.dateAdministered}
                onChange={(e) => setFormData({ ...formData, dateAdministered: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Due Date
              </label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dose Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.doseNumber}
                  onChange={(e) => setFormData({ ...formData, doseNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Doses
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalDoses}
                  onChange={(e) => setFormData({ ...formData, totalDoses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Side Effects
              </label>
              <textarea
                value={formData.sideEffects}
                onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                rows="2"
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
                rows="2"
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
                {editingId ? 'Update' : 'Add'} Vaccination
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vaccination List */}
      <div className="grid gap-4">
        {vaccinations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Syringe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vaccination records yet</p>
          </div>
        ) : (
          vaccinations.map((vaccination) => (
            <div key={vaccination._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {vaccination.vaccineName}
                  </h3>
                  <p className="text-gray-600">{vaccination.diseaseTarget}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vaccination.status)}`}>
                  {vaccination.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 text-sm">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium">
                    {new Date(vaccination.dateAdministered).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Dose:</span>
                  <span className="ml-2 font-medium">
                    {vaccination.doseNumber} of {vaccination.totalDoses}
                  </span>
                </div>
                {vaccination.nextDueDate && (
                  <div>
                    <span className="text-gray-600">Next Due:</span>
                    <span className="ml-2 font-medium">
                      {new Date(vaccination.nextDueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {vaccination.manufacturer && (
                  <div>
                    <span className="text-gray-600">Manufacturer:</span>
                    <span className="ml-2 font-medium">{vaccination.manufacturer}</span>
                  </div>
                )}
                {vaccination.location && (
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">{vaccination.location}</span>
                  </div>
                )}
              </div>

              {vaccination.notes && (
                <p className="text-sm text-gray-600 mb-3">{vaccination.notes}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(vaccination)}
                  className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(vaccination._id)}
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

export default Vaccinations;
