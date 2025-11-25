const mongoose = require('mongoose');

const reportCommentSchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

// Indexes
reportCommentSchema.index({ report: 1, createdAt: -1 });
reportCommentSchema.index({ user: 1 });

module.exports = mongoose.model('ReportComment', reportCommentSchema);
