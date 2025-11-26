const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'mental-health', 'chronic-illness', 'pregnancy', 'fitness', 'nutrition', 'caregiving', 'success-stories', 'questions', 'support'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [String],
  anonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'flagged', 'deleted'],
    default: 'active'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    anonymous: {
      type: Boolean,
      default: false
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    isAccepted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Virtual for like count
forumPostSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for reply count
forumPostSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Update lastActivity on reply
forumPostSchema.pre('save', function(next) {
  if (this.isModified('replies')) {
    this.lastActivity = new Date();
  }
  next();
});

module.exports = mongoose.model('ForumPost', forumPostSchema);
