const mongoose = require('mongoose');

const videoConsultationSchema = new mongoose.Schema({
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
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'missed'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true
  },
  symptoms: [String],
  notes: {
    type: String
  },
  doctorNotes: {
    type: String
  },
  prescription: {
    type: String
  },
  roomId: {
    type: String,
    unique: true,
    sparse: true
  },
  startTime: Date,
  endTime: Date,
  recordingUrl: String,
  meetingLink: String,
  cancelReason: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String
}, { 
  timestamps: true 
});

// Generate unique room ID
videoConsultationSchema.methods.generateRoomId = function() {
  this.roomId = `VC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return this.roomId;
};

// Virtual for duration in hours
videoConsultationSchema.virtual('durationInHours').get(function() {
  return this.duration / 60;
});

// Check if consultation is upcoming
videoConsultationSchema.virtual('isUpcoming').get(function() {
  return this.status === 'scheduled' && this.scheduledDate > new Date();
});

module.exports = mongoose.model('VideoConsultation', videoConsultationSchema);
