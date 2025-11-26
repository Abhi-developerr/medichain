const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordType: {
    type: String,
    enum: ['personal-info', 'medical-history', 'surgical-history', 'family-history', 'lifestyle', 'immunization'],
    required: true
  },
  // Personal Information
  personalInfo: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    bloodType: String,
    height: Number, // in cm
    weight: Number, // in kg
    bmi: Number,
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed']
    },
    occupation: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },
  // Medical History
  medicalHistory: {
    chronicConditions: [{
      condition: String,
      diagnosedDate: Date,
      status: {
        type: String,
        enum: ['active', 'resolved', 'managed']
      },
      notes: String
    }],
    pastIllnesses: [{
      illness: String,
      date: Date,
      treatment: String,
      resolved: Boolean
    }],
    currentMedications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      prescribedBy: String,
      purpose: String
    }],
    allergies: [{
      allergen: String,
      type: {
        type: String,
        enum: ['drug', 'food', 'environmental', 'other']
      },
      reaction: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      }
    }]
  },
  // Surgical History
  surgicalHistory: [{
    procedure: String,
    date: Date,
    hospital: String,
    surgeon: String,
    complications: String,
    outcome: String,
    notes: String
  }],
  // Family History
  familyHistory: [{
    relation: String,
    condition: String,
    ageOfOnset: Number,
    currentStatus: String,
    notes: String
  }],
  // Lifestyle
  lifestyle: {
    smoking: {
      status: {
        type: String,
        enum: ['never', 'former', 'current']
      },
      packsPerDay: Number,
      yearsSmoking: Number,
      quitDate: Date
    },
    alcohol: {
      frequency: {
        type: String,
        enum: ['never', 'occasionally', 'regularly', 'daily']
      },
      drinksPerWeek: Number
    },
    exercise: {
      frequency: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very-active']
      },
      minutesPerWeek: Number,
      activities: [String]
    },
    diet: {
      type: {
        type: String,
        enum: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'other']
      },
      restrictions: [String],
      supplements: [String]
    },
    sleep: {
      hoursPerNight: Number,
      quality: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent']
      },
      issues: [String]
    },
    stress: {
      level: {
        type: String,
        enum: ['low', 'moderate', 'high']
      },
      sources: [String],
      copingMechanisms: [String]
    }
  },
  // Immunization Records
  immunizations: [{
    vaccine: String,
    date: Date,
    nextDueDate: Date,
    provider: String,
    lotNumber: String,
    site: String,
    reactions: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
healthRecordSchema.index({ user: 1, recordType: 1 });
healthRecordSchema.index({ user: 1, lastUpdated: -1 });

// Update lastUpdated on save
healthRecordSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
