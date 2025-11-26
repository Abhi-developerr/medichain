const mongoose = require('mongoose');

const healthAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Vital Signs Trends
  vitalsAnalytics: {
    bloodPressure: {
      average: {
        systolic: Number,
        diastolic: Number
      },
      highest: {
        systolic: Number,
        diastolic: Number,
        date: Date
      },
      lowest: {
        systolic: Number,
        diastolic: Number,
        date: Date
      },
      trend: {
        type: String,
        enum: ['improving', 'stable', 'worsening']
      },
      dataPoints: [{
        value: {
          systolic: Number,
          diastolic: Number
        },
        date: Date
      }]
    },
    heartRate: {
      average: Number,
      highest: { value: Number, date: Date },
      lowest: { value: Number, date: Date },
      restingAverage: Number,
      trend: String,
      dataPoints: [{ value: Number, date: Date }]
    },
    weight: {
      current: Number,
      change: Number,
      changePercentage: Number,
      trend: String,
      dataPoints: [{ value: Number, date: Date }]
    },
    bmi: {
      current: Number,
      category: {
        type: String,
        enum: ['underweight', 'normal', 'overweight', 'obese']
      },
      trend: String
    },
    bloodSugar: {
      average: Number,
      fasting: { average: Number, dataPoints: [{ value: Number, date: Date }] },
      postMeal: { average: Number, dataPoints: [{ value: Number, date: Date }] },
      hba1c: Number,
      trend: String
    },
    oxygenSaturation: {
      average: Number,
      lowest: { value: Number, date: Date },
      dataPoints: [{ value: Number, date: Date }]
    }
  },
  // Activity Analytics
  activityAnalytics: {
    steps: {
      total: Number,
      dailyAverage: Number,
      goalAchievement: Number, // percentage
      dataPoints: [{ value: Number, date: Date }]
    },
    calories: {
      burned: Number,
      consumed: Number,
      netBalance: Number,
      dailyAverage: Number
    },
    exercise: {
      totalMinutes: Number,
      sessions: Number,
      averageDuration: Number,
      types: [{
        type: String,
        minutes: Number,
        sessions: Number
      }]
    },
    sleep: {
      averageHours: Number,
      qualityScore: Number,
      dataPoints: [{
        hours: Number,
        quality: String,
        date: Date
      }]
    }
  },
  // Medication Adherence
  medicationAnalytics: {
    adherenceRate: Number, // percentage
    missedDoses: Number,
    totalDoses: Number,
    medications: [{
      name: String,
      adherenceRate: Number,
      missedDoses: Number
    }]
  },
  // Appointment Analytics
  appointmentAnalytics: {
    total: Number,
    completed: Number,
    cancelled: Number,
    noShow: Number,
    bySpecialty: [{
      specialty: String,
      count: Number
    }]
  },
  // Symptom Patterns
  symptomPatterns: [{
    symptom: String,
    frequency: Number,
    severity: String,
    triggers: [String],
    relief: [String]
  }],
  // Health Scores
  healthScores: {
    overall: {
      type: Number,
      min: 0,
      max: 100
    },
    cardiovascular: Number,
    metabolic: Number,
    mental: Number,
    physical: Number
  },
  // AI Insights
  insights: [{
    category: {
      type: String,
      enum: ['improvement', 'warning', 'achievement', 'recommendation']
    },
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    actionable: Boolean,
    actions: [String]
  }],
  // Goals Progress
  goalsProgress: [{
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthGoal'
    },
    progress: Number,
    onTrack: Boolean
  }],
  // Risk Assessments
  riskAssessments: [{
    condition: String,
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    factors: [String],
    recommendations: [String]
  }]
}, {
  timestamps: true
});

// Indexes
healthAnalyticsSchema.index({ user: 1, period: 1, startDate: -1 });
healthAnalyticsSchema.index({ user: 1, endDate: -1 });

module.exports = mongoose.model('HealthAnalytics', healthAnalyticsSchema);
