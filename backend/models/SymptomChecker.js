const mongoose = require('mongoose');

const symptomCheckerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  symptoms: [{
    symptom: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    duration: String,
    bodyPart: String,
    onset: {
      type: String,
      enum: ['sudden', 'gradual']
    }
  }],
  additionalInfo: {
    age: Number,
    gender: String,
    existingConditions: [String],
    currentMedications: [String],
    recentTravel: Boolean,
    recentInjury: Boolean,
    fever: Boolean,
    temperature: Number
  },
  aiAnalysis: {
    possibleConditions: [{
      condition: String,
      probability: Number,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      description: String,
      commonCauses: [String],
      whenToSeeDuctor: String
    }],
    recommendations: [{
      type: {
        type: String,
        enum: ['self-care', 'home-remedy', 'otc-medication', 'doctor-visit', 'emergency']
      },
      description: String,
      urgency: {
        type: String,
        enum: ['routine', 'soon', 'urgent', 'emergency']
      }
    }],
    redFlags: [String],
    disclaimer: {
      type: String,
      default: 'This is not a medical diagnosis. Please consult a healthcare professional for proper evaluation.'
    },
    confidence: Number
  },
  specialistRecommendations: [{
    specialty: String,
    reason: String
  }],
  relatedArticles: [{
    title: String,
    url: String,
    source: String
  }],
  followUpActions: [{
    action: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  doctorConsultation: {
    requested: {
      type: Boolean,
      default: false
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'monitoring'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
symptomCheckerSchema.index({ user: 1, createdAt: -1 });
symptomCheckerSchema.index({ sessionId: 1 });

module.exports = mongoose.model('SymptomChecker', symptomCheckerSchema);
