const HealthAnalytics = require('../models/HealthAnalytics');
const HealthRecord = require('../models/HealthRecord');
const Telemedicine = require('../models/Telemedicine');

// Generate analytics for a period
exports.generateAnalytics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.body;
    
    // Fetch user's health data
    const healthRecords = await HealthRecord.find({ user: req.user._id });
    const appointments = await Telemedicine.find({ 
      patient: req.user._id,
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
    
    // Calculate analytics
    const vitalsAnalytics = calculateVitalsAnalytics(healthRecords, startDate, endDate);
    const activityAnalytics = calculateActivityAnalytics(healthRecords);
    const medicationAdherence = calculateMedicationAdherence(healthRecords);
    const appointmentAnalytics = calculateAppointmentAnalytics(appointments);
    const healthScores = calculateHealthScores(vitalsAnalytics, activityAnalytics);
    const insights = generateInsights(vitalsAnalytics, activityAnalytics, healthScores);
    const riskAssessments = generateRiskAssessments(healthRecords, vitalsAnalytics);
    
    const analytics = await HealthAnalytics.findOneAndUpdate(
      { user: req.user._id, period, startDate, endDate },
      {
        user: req.user._id,
        period,
        startDate,
        endDate,
        vitalsAnalytics,
        activityAnalytics,
        medicationAdherence,
        appointmentAnalytics,
        healthScores,
        insights,
        riskAssessments
      },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { period } = req.query;
    
    const query = { user: req.user._id };
    if (period) query.period = period;
    
    const analytics = await HealthAnalytics.find(query)
      .sort({ startDate: -1 });
    
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single analytics period
exports.getAnalyticsPeriod = async (req, res) => {
  try {
    const analytics = await HealthAnalytics.findOne({
      user: req.user._id,
      _id: req.params.id
    });
    
    if (!analytics) {
      return res.status(404).json({ success: false, message: 'Analytics not found' });
    }
    
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get vitals trends
exports.getVitalsTrends = async (req, res) => {
  try {
    const { vital } = req.params;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const analytics = await HealthAnalytics.find({
      user: req.user._id,
      startDate: { $gte: startDate }
    }).sort({ startDate: 1 });
    
    const trends = analytics.map(a => ({
      date: a.startDate,
      value: a.vitalsAnalytics[vital]
    }));
    
    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper functions
function calculateVitalsAnalytics(healthRecords, startDate, endDate) {
  // Mock implementation - in production, aggregate actual vital sign readings
  return {
    bloodPressure: {
      averageSystolic: 120,
      averageDiastolic: 80,
      highest: { systolic: 135, diastolic: 88, date: new Date() },
      lowest: { systolic: 110, diastolic: 70, date: new Date() },
      trend: 'stable',
      dataPoints: []
    },
    heartRate: {
      average: 72,
      highest: 95,
      lowest: 60,
      restingAverage: 68,
      trend: 'stable',
      dataPoints: []
    },
    weight: {
      current: 70,
      change: -2,
      changePercentage: -2.8,
      trend: 'improving',
      dataPoints: []
    },
    BMI: {
      current: 23.5,
      category: 'normal',
      trend: 'stable'
    }
  };
}

function calculateActivityAnalytics(healthRecords) {
  return {
    steps: {
      total: 210000,
      dailyAverage: 7000,
      goalAchievement: 70,
      dataPoints: []
    },
    calories: {
      burned: 14000,
      consumed: 60000,
      netBalance: -46000,
      dailyAverage: 2000
    },
    exercise: {
      totalMinutes: 600,
      sessions: 20,
      averageDuration: 30,
      byType: [
        { type: 'Running', minutes: 300 },
        { type: 'Yoga', minutes: 200 },
        { type: 'Strength Training', minutes: 100 }
      ]
    },
    sleep: {
      averageHours: 7.5,
      qualityScore: 78,
      dataPoints: []
    }
  };
}

function calculateMedicationAdherence(healthRecords) {
  // Mock - in production, calculate from medication tracker
  return {
    overall: 85,
    missedDoses: 5,
    totalDoses: 33,
    byMedication: [
      { medication: 'Lisinopril', adherenceRate: 90, missedDoses: 3 },
      { medication: 'Metformin', adherenceRate: 80, missedDoses: 2 }
    ]
  };
}

function calculateAppointmentAnalytics(appointments) {
  return {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    noShow: appointments.filter(a => a.status === 'no-show').length,
    bySpecialty: []
  };
}

function calculateHealthScores(vitals, activity) {
  const cardiovascular = (vitals.bloodPressure.trend === 'improving' ? 85 : 75) +
                        (vitals.heartRate.restingAverage < 70 ? 10 : 0);
  
  const physical = (activity.steps.goalAchievement * 0.4) +
                   (activity.exercise.totalMinutes > 500 ? 30 : 20);
  
  const overall = Math.round((cardiovascular + physical + 75 + 80) / 4);
  
  return {
    overall,
    cardiovascular: Math.min(cardiovascular, 100),
    metabolic: 75,
    mental: 80,
    physical: Math.min(physical, 100)
  };
}

function generateInsights(vitals, activity, scores) {
  const insights = [];
  
  if (vitals.weight.trend === 'improving') {
    insights.push({
      category: 'achievement',
      title: 'Weight Loss Progress',
      description: `You've lost ${Math.abs(vitals.weight.change)}kg this period. Great work!`,
      priority: 'medium',
      actionable: false
    });
  }
  
  if (activity.steps.goalAchievement < 70) {
    insights.push({
      category: 'recommendation',
      title: 'Increase Daily Steps',
      description: 'Try to reach 10,000 steps daily for better cardiovascular health.',
      priority: 'high',
      actionable: true,
      actions: ['Set step reminders', 'Take walking breaks', 'Use stairs']
    });
  }
  
  if (scores.overall > 80) {
    insights.push({
      category: 'achievement',
      title: 'Excellent Health Score',
      description: 'Your overall health score is outstanding. Keep up the great habits!',
      priority: 'low',
      actionable: false
    });
  }
  
  return insights;
}

function generateRiskAssessments(healthRecords, vitals) {
  const assessments = [];
  
  // Check for hypertension risk
  if (vitals.bloodPressure.averageSystolic > 130) {
    assessments.push({
      condition: 'Hypertension',
      riskLevel: 'moderate',
      factors: ['Elevated blood pressure readings', 'Family history'],
      recommendations: [
        'Reduce sodium intake',
        'Increase physical activity',
        'Monitor blood pressure regularly',
        'Consult with cardiologist'
      ]
    });
  }
  
  // Check BMI-related risks
  if (vitals.BMI.current > 25) {
    assessments.push({
      condition: 'Metabolic Syndrome',
      riskLevel: 'low',
      factors: ['BMI above normal range'],
      recommendations: [
        'Maintain balanced diet',
        'Regular exercise routine',
        'Monitor weight weekly'
      ]
    });
  }
  
  return assessments;
}

module.exports = exports;
