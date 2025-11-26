const mongoose = require('mongoose');

const telemedicineSchema = new mongoose.Schema({
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
  appointmentDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30 // in minutes
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['video', 'audio', 'chat'],
    default: 'video'
  },
  symptoms: String,
  chiefComplaint: String,
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    oxygenSaturation: Number,
    weight: Number
  },
  diagnosis: String,
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  labTestsOrdered: [{
    testName: String,
    reason: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'stat']
    }
  }],
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    date: Date,
    notes: String
  },
  sessionNotes: String,
  attachments: [{
    fileId: String,
    fileName: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  meetingLink: String,
  recordingUrl: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  amount: Number,
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
telemedicineSchema.index({ patient: 1, appointmentDate: -1 });
telemedicineSchema.index({ doctor: 1, appointmentDate: -1 });
telemedicineSchema.index({ status: 1, appointmentDate: 1 });

module.exports = mongoose.model('Telemedicine', telemedicineSchema);
