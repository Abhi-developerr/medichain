import { useState, useEffect } from 'react';
import { AlertOctagon, Heart, UserPlus, Phone, MapPin, Bell, Settings, Shield, Activity } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const EmergencySOS = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medical-id');
  const [showSOSButton, setShowSOSButton] = useState(false);
  const [sosTriggering, setSosTriggering] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/emergency-sos/profile');
      setProfile(response.data.profile);
      setFormData(response.data.profile?.medicalID || {});
    } catch (error) {
      toast.error('Failed to load emergency profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMedicalID = async (e) => {
    e.preventDefault();
    try {
      await api.put('/emergency-sos/medical-id', formData);
      toast.success('Medical ID updated!');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update Medical ID');
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/emergency-sos/contacts', formData);
      toast.success('Emergency contact added!');
      setFormData({});
      fetchProfile();
    } catch (error) {
      toast.error('Failed to add contact');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Remove this emergency contact?')) return;
    try {
      await api.delete(`/emergency-sos/contacts/${contactId}`);
      toast.success('Contact removed');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to remove contact');
    }
  };

  const handleTriggerSOS = async () => {
    if (!window.confirm('Trigger emergency SOS alert? This will notify all your emergency contacts.')) return;

    setSosTriggering(true);
    try {
      const location = await new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address: 'Current Location'
              });
            },
            () => resolve({ address: 'Location unavailable' })
          );
        } else {
          resolve({ address: 'Location unavailable' });
        }
      });

      await api.post('/emergency-sos/trigger', {
        type: 'manual',
        description: 'Emergency SOS triggered manually',
        location
      });

      toast.success('🚨 SOS Alert sent to all emergency contacts!');
      setShowSOSButton(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to trigger SOS');
    } finally {
      setSosTriggering(false);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      await api.put('/emergency-sos/settings', newSettings);
      toast.success('Settings updated!');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with SOS Button */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <AlertOctagon className="w-10 h-10 text-red-600" />
              Emergency SOS
            </h1>
            <p className="text-gray-600">Manage your medical ID and emergency contacts</p>
          </div>

          <button
            onClick={() => setShowSOSButton(!showSOSButton)}
            className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center gap-2 shadow-lg animate-pulse"
          >
            <AlertOctagon className="w-5 h-5" />
            Emergency SOS
          </button>
        </div>

        {/* SOS Confirmation */}
        {showSOSButton && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertOctagon className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-red-900 mb-2">Trigger Emergency Alert</h3>
                <p className="text-red-700 mb-4">
                  This will immediately notify all your emergency contacts with your location and medical information.
                  Use this only in real emergencies.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleTriggerSOS}
                    disabled={sosTriggering}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {sosTriggering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Sending Alert...
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        Send SOS Alert
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowSOSButton(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-xl">
          <div className="flex border-b">
            {[
              { id: 'medical-id', label: 'Medical ID', icon: <Heart className="w-4 h-4" /> },
              { id: 'contacts', label: 'Emergency Contacts', icon: <Phone className="w-4 h-4" /> },
              { id: 'history', label: 'SOS History', icon: <Activity className="w-4 h-4" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-medium flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-b-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto" />
          </div>
        ) : (
          <div className="bg-white rounded-b-2xl shadow-xl p-8">
            {/* Medical ID Tab */}
            {activeTab === 'medical-id' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-600" />
                  Medical ID
                </h2>

                <form onSubmit={handleUpdateMedicalID} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                      <select
                        value={formData.bloodType || ''}
                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select Blood Type</option>
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                      <input
                        type="number"
                        value={formData.height || ''}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="organDonor"
                        checked={formData.organDonor || false}
                        onChange={(e) => setFormData({ ...formData, organDonor: e.target.checked })}
                        className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                      />
                      <label htmlFor="organDonor" className="text-sm font-medium text-gray-700">
                        Organ Donor
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies (comma separated)</label>
                    <input
                      type="text"
                      value={formData.allergies?.join(', ') || ''}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value.split(',').map(a => a.trim()) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="e.g. Penicillin, Peanuts, Latex"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medications (comma separated)</label>
                    <input
                      type="text"
                      value={formData.medications?.join(', ') || ''}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value.split(',').map(m => m.trim()) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="e.g. Aspirin, Metformin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions (comma separated)</label>
                    <input
                      type="text"
                      value={formData.conditions?.join(', ') || ''}
                      onChange={(e) => setFormData({ ...formData, conditions: e.target.value.split(',').map(c => c.trim()) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="e.g. Diabetes, Hypertension"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
                  >
                    Save Medical ID
                  </button>
                </form>
              </div>
            )}

            {/* Emergency Contacts Tab */}
            {activeTab === 'contacts' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Phone className="w-6 h-6 text-red-600" />
                  Emergency Contacts
                </h2>

                {/* Existing Contacts */}
                <div className="mb-8 space-y-4">
                  {profile?.emergencyContacts?.map((contact) => (
                    <div key={contact._id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{contact.name}</h4>
                          {contact.isPrimary && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Primary</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{contact.relationship}</p>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteContact(contact._id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Contact */}
                <form onSubmit={handleAddContact} className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add Emergency Contact
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={formData.relationship || ''}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={formData.isPrimary || false}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <label htmlFor="isPrimary" className="text-sm text-gray-700">Set as primary contact</label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
                  >
                    Add Contact
                  </button>
                </form>
              </div>
            )}

            {/* SOS History Tab */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-red-600" />
                  SOS Alert History
                </h2>

                {profile?.sosAlerts?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>No SOS alerts triggered yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile?.sosAlerts?.map((alert) => (
                      <div key={alert._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.status === 'active' ? 'bg-red-100 text-red-700' :
                              alert.status === 'resolved' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{alert.description || 'Emergency alert'}</p>
                        {alert.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.location.address || `${alert.location.latitude}, ${alert.location.longitude}`}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Notified {alert.notifiedContacts?.length || 0} contacts
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-red-600" />
                  Emergency Settings
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Auto-notify contacts</h4>
                      <p className="text-sm text-gray-600">Automatically notify all emergency contacts when SOS is triggered</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile?.settings?.autoNotify || false}
                      onChange={(e) => handleUpdateSettings({ ...profile.settings, autoNotify: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Share location</h4>
                      <p className="text-sm text-gray-600">Include GPS coordinates in emergency alerts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile?.settings?.shareLocation || false}
                      onChange={(e) => handleUpdateSettings({ ...profile.settings, shareLocation: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Fall detection</h4>
                      <p className="text-sm text-gray-600">Automatically trigger SOS if a hard fall is detected (requires device support)</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile?.settings?.fallDetection || false}
                      onChange={(e) => handleUpdateSettings({ ...profile.settings, fallDetection: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Auto-call emergency services</h4>
                      <p className="text-sm text-gray-600">Automatically call emergency services after countdown</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile?.settings?.autoCallEmergency || false}
                      onChange={(e) => handleUpdateSettings({ ...profile.settings, autoCallEmergency: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencySOS;
