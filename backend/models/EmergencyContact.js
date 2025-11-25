const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide contact name'],
    trim: true
  },
  relationship: {
    type: String,
    required: [true, 'Please provide relationship'],
    enum: ['spouse', 'parent', 'child', 'sibling', 'friend', 'other']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide phone number']
  },
  email: {
    type: String,
    lowercase: true
  },
  address: String,
  isPrimary: {
    type: Boolean,
    default: false
  },
  canAccessReports: {
    type: Boolean,
    default: false
  },
  notes: String
}, {
  timestamps: true
});

// Index for faster queries
emergencyContactSchema.index({ user: 1, isPrimary: -1 });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
