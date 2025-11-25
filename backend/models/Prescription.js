const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['once-daily', 'twice-daily', 'thrice-daily', 'four-times-daily', 'as-needed', 'custom']
  },
  customFrequency: String,
  duration: {
    type: String,
    required: true
  },
  instructions: String,
  beforeFood: {
    type: Boolean,
    default: false
  }
});

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: {
    type: String,
    required: true
  },
  medications: [medicationSchema],
  labTests: [{
    testName: String,
    instructions: String,
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine'
    }
  }],
  generalInstructions: String,
  followUpDate: Date,
  followUpInstructions: String,
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
