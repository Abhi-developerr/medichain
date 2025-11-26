import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

function SymptomChecker() {
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState([{ symptom: '', severity: 'mild', duration: '', bodyPart: '', onset: 'gradual' }]);
  const [additionalInfo, setAdditionalInfo] = useState({
    age: '',
    gender: '',
    existingConditions: [],
    currentMedications: [],
    fever: false,
    temperature: ''
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/symptom-checker');
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to fetch sessions');
    }
  };

  const addSymptom = () => {
    setSymptoms([...symptoms, { symptom: '', severity: 'mild', duration: '', bodyPart: '', onset: 'gradual' }]);
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const updateSymptom = (index, field, value) => {
    const updated = [...symptoms];
    updated[index][field] = value;
    setSymptoms(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/symptom-checker', {
        symptoms: symptoms.filter(s => s.symptom),
        additionalInfo
      });
      
      setAnalysis(response.data.session);
      setStep(3);
      fetchSessions();
      toast.success('Analysis complete');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'soon': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'routine': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Describe Your Symptoms</h2>
      
      {symptoms.map((symptom, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold">Symptom {index + 1}</h3>
            {symptoms.length > 1 && (
              <button
                type="button"
                onClick={() => removeSymptom(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What symptom are you experiencing? *
              </label>
              <input
                type="text"
                required
                value={symptom.symptom}
                onChange={(e) => updateSymptom(index, 'symptom', e.target.value)}
                placeholder="e.g., headache, fever, cough"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={symptom.severity}
                onChange={(e) => updateSymptom(index, 'severity', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                value={symptom.duration}
                onChange={(e) => updateSymptom(index, 'duration', e.target.value)}
                placeholder="e.g., 2 days, 1 week"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Part</label>
              <input
                type="text"
                value={symptom.bodyPart}
                onChange={(e) => updateSymptom(index, 'bodyPart', e.target.value)}
                placeholder="e.g., head, chest, abdomen"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Onset</label>
              <select
                value={symptom.onset}
                onChange={(e) => updateSymptom(index, 'onset', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="sudden">Sudden</option>
                <option value="gradual">Gradual</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSymptom}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        + Add Another Symptom
      </button>

      <div className="flex justify-end">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Additional Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            value={additionalInfo.age}
            onChange={(e) => setAdditionalInfo({ ...additionalInfo, age: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={additionalInfo.gender}
            onChange={(e) => setAdditionalInfo({ ...additionalInfo, gender: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={additionalInfo.fever}
              onChange={(e) => setAdditionalInfo({ ...additionalInfo, fever: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Do you have a fever?</span>
          </label>
        </div>

        {additionalInfo.fever && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
            <input
              type="number"
              step="0.1"
              value={additionalInfo.temperature}
              onChange={(e) => setAdditionalInfo({ ...additionalInfo, temperature: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Get Analysis'}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>

      {/* Red Flags */}
      {analysis?.aiAnalysis?.redFlags?.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Important Warnings</h3>
          <ul className="list-disc list-inside space-y-1">
            {analysis.aiAnalysis.redFlags.map((flag, idx) => (
              <li key={idx} className="text-red-700">{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Possible Conditions */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Possible Conditions</h3>
        <div className="space-y-3">
          {analysis?.aiAnalysis?.possibleConditions?.map((condition, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">{condition.condition}</h4>
                <span className="text-sm text-gray-600">{(condition.probability * 100).toFixed(0)}% match</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{condition.description}</p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">When to see a doctor:</span> {condition.whenToSeeDoctor}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Recommendations</h3>
        <div className="space-y-2">
          {analysis?.aiAnalysis?.recommendations?.map((rec, idx) => (
            <div key={idx} className={`border rounded-lg p-4 ${getUrgencyColor(rec.urgency)}`}>
              <div className="flex justify-between items-start">
                <p className="font-medium">{rec.description}</p>
                <span className="text-xs uppercase font-bold">{rec.urgency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specialist Recommendations */}
      {analysis?.specialistRecommendations?.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Recommended Specialists</h3>
          <div className="space-y-2">
            {analysis.specialistRecommendations.map((spec, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-medium">{spec.specialty}</p>
                <p className="text-sm text-gray-600">{spec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> This analysis is for informational purposes only and should not replace professional medical advice. 
          Please consult with a healthcare provider for accurate diagnosis and treatment.
        </p>
      </div>

      <button
        onClick={() => { setStep(1); setAnalysis(null); }}
        className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Start New Check
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Symptom Checker</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Previous Sessions */}
      {sessions.length > 0 && step === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Previous Checks</h2>
          <div className="space-y-2">
            {sessions.slice(0, 3).map((session) => (
              <div key={session._id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {session.symptoms.map(s => s.symptom).join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    session.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SymptomChecker;
