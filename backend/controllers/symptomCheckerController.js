const SymptomChecker = require('../models/SymptomChecker');
const { v4: uuidv4 } = require('uuid');

// Create symptom check session
exports.createSession = async (req, res) => {
  try {
    const { symptoms, additionalInfo } = req.body;
    
    // Generate AI analysis (mock implementation)
    const aiAnalysis = generateAIAnalysis(symptoms, additionalInfo);
    
    const session = await SymptomChecker.create({
      user: req.user._id,
      sessionId: uuidv4(),
      symptoms,
      additionalInfo,
      aiAnalysis,
      specialistRecommendations: determineSpecialists(aiAnalysis.possibleConditions)
    });
    
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await SymptomChecker.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single session
exports.getSession = async (req, res) => {
  try {
    const session = await SymptomChecker.findOne({
      user: req.user._id,
      sessionId: req.params.sessionId
    });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update session status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const session = await SymptomChecker.findOneAndUpdate(
      { user: req.user._id, sessionId: req.params.sessionId },
      { status },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete follow-up action
exports.completeAction = async (req, res) => {
  try {
    const { actionIndex } = req.body;
    
    const session = await SymptomChecker.findOne({
      user: req.user._id,
      sessionId: req.params.sessionId
    });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    session.followUpActions[actionIndex].completed = true;
    session.followUpActions[actionIndex].completedAt = new Date();
    await session.save();
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to generate AI analysis (mock)
function generateAIAnalysis(symptoms, additionalInfo) {
  // This is a mock implementation - in production, integrate with medical AI API
  const conditionsDatabase = {
    'headache': [
      { condition: 'Tension Headache', probability: 0.65, severity: 'low' },
      { condition: 'Migraine', probability: 0.25, severity: 'medium' },
      { condition: 'Cluster Headache', probability: 0.10, severity: 'high' }
    ],
    'fever': [
      { condition: 'Viral Infection', probability: 0.70, severity: 'low' },
      { condition: 'Bacterial Infection', probability: 0.20, severity: 'medium' },
      { condition: 'COVID-19', probability: 0.10, severity: 'medium' }
    ],
    'cough': [
      { condition: 'Common Cold', probability: 0.60, severity: 'low' },
      { condition: 'Bronchitis', probability: 0.25, severity: 'medium' },
      { condition: 'Pneumonia', probability: 0.15, severity: 'high' }
    ]
  };
  
  const possibleConditions = [];
  const redFlags = [];
  const recommendations = [];
  
  symptoms.forEach(symptom => {
    const matches = conditionsDatabase[symptom.symptom.toLowerCase()] || [
      { condition: 'Unknown Condition', probability: 0.30, severity: 'medium' }
    ];
    
    possibleConditions.push(...matches.map(c => ({
      ...c,
      description: `${c.condition} is characterized by ${symptom.symptom}.`,
      commonCauses: ['Stress', 'Infection', 'Environmental factors'],
      whenToSeeDoctor: c.severity === 'high' ? 'Within 24 hours' : 'If symptoms persist for more than 3 days'
    })));
    
    if (symptom.severity === 'severe') {
      redFlags.push(`Severe ${symptom.symptom} requires immediate medical attention`);
      recommendations.push({
        type: 'doctor-visit',
        description: 'Schedule an appointment with a healthcare provider',
        urgency: 'urgent'
      });
    }
  });
  
  if (additionalInfo.fever && additionalInfo.temperature > 103) {
    redFlags.push('High fever (>103°F) - seek immediate care');
    recommendations.push({
      type: 'emergency',
      description: 'Visit emergency room or call emergency services',
      urgency: 'emergency'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'self-care',
      description: 'Rest, stay hydrated, and monitor symptoms',
      urgency: 'routine'
    });
  }
  
  return {
    possibleConditions: possibleConditions.slice(0, 5),
    recommendations,
    redFlags,
    confidence: 0.75
  };
}

function determineSpecialists(conditions) {
  const specialtyMap = {
    'Migraine': 'Neurologist',
    'Pneumonia': 'Pulmonologist',
    'COVID-19': 'Infectious Disease Specialist'
  };
  
  const specialists = [];
  conditions.forEach(c => {
    if (specialtyMap[c.condition]) {
      specialists.push({
        specialty: specialtyMap[c.condition],
        reason: `For evaluation of ${c.condition}`
      });
    }
  });
  
  return specialists;
}
