const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS', 'DOWNLOAD', 'SHARE']
  },
  resource: {
    type: String,
    required: true // e.g., 'Report', 'User', 'Appointment'
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: Object // Additional details about the action
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
