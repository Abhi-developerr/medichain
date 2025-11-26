const mongoose = require('mongoose');

const healthChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    sentiment: String, // positive, negative, neutral, urgent
    tags: [String] // symptom, medication, emergency, etc.
  }],
  category: {
    type: String,
    enum: ['general', 'symptoms', 'medication', 'emergency', 'mental-health', 'nutrition', 'exercise', 'other'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'flagged'],
    default: 'active'
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: String, // emergency detected, concerning symptoms, etc.
  summary: String,
  recommendations: [String],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Generate unique session ID
healthChatSchema.pre('save', function(next) {
  if (!this.sessionId) {
    this.sessionId = `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  this.lastActivity = new Date();
  next();
});

// Virtual for message count
healthChatSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

module.exports = mongoose.model('HealthChat', healthChatSchema);
