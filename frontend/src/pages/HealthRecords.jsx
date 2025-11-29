import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function HealthRecords() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal-info');
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const tabs = [
    { id: 'personal-info', label: 'Personal Info', icon: '👤' },
    { id: 'medical-history', label: 'Medical History', icon: '🏥' },
    { id: 'surgical-history', label: 'Surgical History', icon: '⚕️' },
    { id: 'family-history', label: 'Family History', icon: '👨‍👩‍👧‍👦' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🏃' },
    { id: 'immunization', label: 'Immunizations', icon: '💉' }
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/health-records/summary');
      setRecords(response.data.summary || {});
    } catch (error) {
      toast.error('Failed to fetch health records');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (recordType, data) => {
    try {
      const userId = 'me'; // Backend will use current user
      await api.put(`/health-records/${userId}/${recordType}`, data);
      toast.success('Record updated successfully');
      setEditMode(false);
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update record');
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={records.personalInfo?.dateOfBirth?.split('T')[0] || ''}
            disabled={!editMode}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select disabled={!editMode} className="w-full px-3 py-2 border rounded-lg">
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
          <select disabled={!editMode} className="w-full px-3 py-2 border rounded-lg">
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>O+</option>
            <option>O-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
          <input
            type="number"
            value={records.personalInfo?.height || ''}
            disabled={!editMode}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            value={records.personalInfo?.weight || ''}
            disabled={!editMode}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
          <input
            type="number"
            value={records.personalInfo?.BMI || ''}
            disabled
            className="w-full px-3 py-2 border rounded-lg bg-gray-50"
          />
        </div>
      </div>
    </div>
  );

  const renderMedicalHistory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Medical History</h2>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Chronic Conditions</h3>
        {records.chronicConditions?.length > 0 ? (
          <div className="space-y-2">
            {records.chronicConditions.map((condition, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">{condition.condition}</h4>
                <p className="text-sm text-gray-600">Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Status: <span className="capitalize">{condition.status}</span></p>
                {condition.notes && <p className="text-sm text-gray-700 mt-1">{condition.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No chronic conditions recorded</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Current Medications</h3>
        {records.currentMedications?.length > 0 ? (
          <div className="space-y-2">
            {records.currentMedications.map((med, idx) => (
              <div key={idx} className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium">{med.medication}</h4>
                <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                <p className="text-sm text-gray-600">Frequency: {med.frequency}</p>
                <p className="text-sm text-gray-600">Purpose: {med.purpose}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No current medications</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Allergies</h3>
        {records.allergies?.length > 0 ? (
          <div className="space-y-2">
            {records.allergies.map((allergy, idx) => (
              <div key={idx} className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium">{allergy.allergen}</h4>
                <p className="text-sm text-gray-600">Type: <span className="capitalize">{allergy.type}</span></p>
                <p className="text-sm text-gray-600">Severity: <span className="capitalize">{allergy.severity}</span></p>
                <p className="text-sm text-gray-700">Reaction: {allergy.reaction}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No allergies recorded</p>
        )}
      </div>
    </div>
  );

  const renderSurgicalHistory = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Surgical History</h2>
      {records.surgicalHistory?.length > 0 ? (
        <div className="space-y-3">
          {records.surgicalHistory.map((surgery, idx) => (
            <div key={idx} className="bg-white border border-gray-200 p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{surgery.procedure}</h3>
              <p className="text-sm text-gray-600">Date: {new Date(surgery.date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Hospital: {surgery.hospital}</p>
              <p className="text-sm text-gray-600">Surgeon: {surgery.surgeon}</p>
              {surgery.outcome && (
                <p className="text-sm text-gray-700 mt-2">Outcome: {surgery.outcome}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No surgical history recorded</p>
      )}
    </div>
  );

  const renderLifestyle = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Lifestyle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">🚬 Smoking</h3>
          <p className="text-sm">Status: Never / Former / Current</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">🍺 Alcohol</h3>
          <p className="text-sm">Frequency: Rarely / Occasionally / Regularly</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">🏃 Exercise</h3>
          <p className="text-sm">Frequency: Sedentary / Light / Moderate / Active</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">🥗 Diet</h3>
          <p className="text-sm">Type: Omnivore / Vegetarian / Vegan</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">😴 Sleep</h3>
          <p className="text-sm">Average: 7-8 hours</p>
          <p className="text-sm">Quality: Good / Fair / Poor</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">😰 Stress</h3>
          <p className="text-sm">Level: Low / Moderate / High</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
        {user?.role === 'patient' && (
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-6 py-2 rounded-lg ${
              editMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {editMode ? 'Save Changes' : 'Edit Records'}
          </button>
        )}
      </div>

      {user?.role === 'doctor' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Doctor View:</strong> Use the patient share code access from your dashboard to view specific patient records.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'personal-info' && renderPersonalInfo()}
        {activeTab === 'medical-history' && renderMedicalHistory()}
        {activeTab === 'surgical-history' && renderSurgicalHistory()}
        {activeTab === 'lifestyle' && renderLifestyle()}
        {activeTab === 'family-history' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Family History</h2>
            <p className="text-gray-500">Family medical history section</p>
          </div>
        )}
        {activeTab === 'immunization' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Immunizations</h2>
            <p className="text-gray-500">Immunization records section</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthRecords;
