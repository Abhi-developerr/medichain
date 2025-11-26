const mongoose = require('mongoose');

const emergencySOSSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicalID: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    allergies: [String],
    medications: [String],
    conditions: [String],
    height: String,
    weight: String,
    organDonor: Boolean,
    specialNotes: String
  },
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    relationship: String,
    phone: {
      type: String,
      required: true
    },
    email: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    address: String
  }],
  sosAlerts: [{
    triggeredAt: {
      type: Date,
      default: Date.now
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    type: {
      type: String,
      enum: ['accident', 'medical-emergency', 'fall', 'panic', 'other'],
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ['active', 'responded', 'resolved', 'cancelled'],
      default: 'active'
    },
    notifiedContacts: [{
      contact: mongoose.Schema.Types.Mixed,
      notifiedAt: Date,
      acknowledged: Boolean
    }],
    responders: [{
      name: String,
      eta: String,
      status: String
    }],
    resolvedAt: Date,
    notes: String
  }],
  quickAccessInfo: {
    insuranceProvider: String,
    policyNumber: String,
    primaryDoctor: {
      name: String,
      phone: String,
      specialization: String
    },
    hospital: {
      name: String,
      phone: String,
      address: String
    }
  },
  settings: {
    autoNotify: {
      type: Boolean,
      default: true
    },
    shareLocation: {
      type: Boolean,
      default: true
    },
    fallDetection: {
      type: Boolean,
      default: false
    },
    autoCallEmergency: {
      type: Boolean,
      default: false
    },
    countdownDuration: {
      type: Number,
      default: 30 // seconds before auto-call
    }
  },
  medicalHistory: {
    lastUpdated: Date,
    summary: String,
    criticalInfo: [String]
  }
}, { 
  timestamps: true 
});

// Ensure only one emergency profile per user
emergencySOSSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('EmergencySOS', emergencySOSSchema);
