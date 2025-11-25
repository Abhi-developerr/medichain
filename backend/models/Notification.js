const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'report_uploaded', 'report_viewed', 'report_note_added', 
      'access_granted', 'access_revoked', 'status_updated',
      'appointment_scheduled', 'appointment_confirmed', 'appointment_cancelled',
      'report_comment', 'report_mention', 'health_metric_alert',
      'prescription_created', 'new_review', 'new_message',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  link: String
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
