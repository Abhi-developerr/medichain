import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Users, Plus, Edit2, Trash2, Phone, Mail, MapPin, Star, Shield, X, Save } from 'lucide-react';

const EmergencyContacts = () => {
  const { API_URL } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'friend',
    phoneNumber: '',
    email: '',
    address: '',
    isPrimary: false,
    canAccessReports: false,
    notes: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/emergency-contacts`);
      setContacts(response.data.contacts);
    } catch (error) {
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await axios.put(`${API_URL}/emergency-contacts/${editingContact._id}`, formData);
        toast.success('Contact updated successfully');
      } else {
        await axios.post(`${API_URL}/emergency-contacts`, formData);
        toast.success('Contact added successfully');
      }
      fetchContacts();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save contact');
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phoneNumber: contact.phoneNumber,
      email: contact.email || '',
      address: contact.address || '',
      isPrimary: contact.isPrimary,
      canAccessReports: contact.canAccessReports,
      notes: contact.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      await axios.delete(`${API_URL}/emergency-contacts/${id}`);
      toast.success('Contact deleted successfully');
      fetchContacts();
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: 'friend',
      phoneNumber: '',
      email: '',
      address: '',
      isPrimary: false,
      canAccessReports: false,
      notes: ''
    });
    setEditingContact(null);
    setShowModal(false);
  };

  const getRelationshipColor = (relationship) => {
    const colors = {
      'spouse': 'from-pink-500 to-rose-500',
      'parent': 'from-blue-500 to-indigo-500',
      'child': 'from-green-500 to-emerald-500',
      'sibling': 'from-purple-500 to-violet-500',
      'friend': 'from-cyan-500 to-blue-500',
      'other': 'from-gray-500 to-slate-500'
    };
    return colors[relationship] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2 flex items-center gap-3">
              <Users className="h-10 w-10 text-blue-600" />
              Emergency Contacts
            </h1>
            <p className="text-gray-600">Manage your emergency contact information</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Contact
          </button>
        </div>

        {/* Contacts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No emergency contacts</h3>
            <p className="text-gray-600 mb-6">Add your first emergency contact to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
            >
              Add Contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contacts.map((contact, index) => (
              <div
                key={contact._id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${getRelationshipColor(contact.relationship)} text-white`}>
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {contact.name}
                        {contact.isPrimary && (
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">{contact.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{contact.phoneNumber}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">{contact.email}</span>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">{contact.address}</span>
                    </div>
                  )}
                  {contact.canAccessReports && (
                    <div className="flex items-center gap-2 pt-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Can access reports</span>
                    </div>
                  )}
                  {contact.notes && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 italic">{contact.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <select
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="sibling">Sibling</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional information..."
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Set as primary contact
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canAccessReports}
                      onChange={(e) => setFormData({ ...formData, canAccessReports: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      Allow access to medical reports
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" />
                    {editingContact ? 'Update Contact' : 'Add Contact'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
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

export default EmergencyContacts;
