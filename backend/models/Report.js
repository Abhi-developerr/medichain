const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a report title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  reportType: {
    type: String,
    enum: ['prescription', 'lab-report', 'scan', 'x-ray', 'other'],
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  
  // Doctor interaction
  viewedBy: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  doctorNotes: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'urgent', 'resolved'],
    default: 'pending'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  isArchived: {
    type: Boolean,
    default: false
  },
  
  category: {
    type: String,
    enum: ['general', 'emergency', 'follow-up', 'routine', 'specialist'],
    default: 'general'
  },
  
  sharedWith: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    accessRevoked: {
      type: Boolean,
      default: false
    },
    revokedAt: Date
  }],
  
  // Metadata
  tags: [String],
  remarks: String,
  expiryDate: Date,
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
reportSchema.index({ patient: 1, uploadDate: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ tags: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ priority: 1 });

module.exports = mongoose.model('Report', reportSchema);