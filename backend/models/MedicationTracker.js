const mongoose = require('mongoose');

const medicationTrackerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicationName: {
    type: String,
    required: true
  },
  dosage: {
    amount: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true // mg, ml, tablets, etc.
    }
  },
  frequency: {
    type: String,
    required: true,
    enum: ['once-daily', 'twice-daily', 'thrice-daily', 'four-times-daily', 'as-needed', 'weekly', 'custom']
  },
  schedule: [{
    time: String, // "08:00", "14:00", "20:00"
    taken: Boolean,
    lastTaken: Date
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  prescribedBy: String,
  purpose: String,
  sideEffects: [String],
  instructions: String,
  refillDate: Date,
  refillReminder: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'discontinued'],
    default: 'active'
  },
  adherenceLog: [{
    date: Date,
    time: String,
    taken: Boolean,
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  interactions: [{
    medication: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    description: String
  }],
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  pillsRemaining: Number,
  totalPills: Number
}, { 
  timestamps: true 
});

// Virtual for adherence rate
medicationTrackerSchema.virtual('adherenceRate').get(function() {
  if (this.adherenceLog.length === 0) return 0;
  const taken = this.adherenceLog.filter(log => log.taken).length;
  return Math.round((taken / this.adherenceLog.length) * 100);
});

// Virtual for pills percentage
medicationTrackerSchema.virtual('pillsPercentage').get(function() {
  if (!this.totalPills) return 0;
  return Math.round((this.pillsRemaining / this.totalPills) * 100);
});

// Check if refill is needed
medicationTrackerSchema.virtual('needsRefill').get(function() {
  return this.pillsRemaining && this.pillsRemaining <= 7;
});

module.exports = mongoose.model('MedicationTracker', medicationTrackerSchema);
