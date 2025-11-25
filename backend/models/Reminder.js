const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicineName: {
    type: String,
    required: [true, 'Please provide medicine name'],
    trim: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['once-daily', 'twice-daily', 'thrice-daily', 'weekly', 'monthly'],
    required: true
  },
  timing: [{
    type: String, // e.g., "08:00", "14:00", "20:00"
    required: true
  }],
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailNotification: {
    type: Boolean,
    default: true
  },
  lastSent: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for active reminders
reminderSchema.index({ patient: 1, isActive: 1, endDate: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);