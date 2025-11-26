const mongoose = require('mongoose');

const healthGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['fitness', 'nutrition', 'mental-health', 'sleep', 'weight', 'medication', 'other'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'paused'],
    default: 'active'
  },
  progress: [{
    value: Number,
    note: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    }
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
healthGoalSchema.virtual('progressPercentage').get(function() {
  return Math.min(100, Math.round((this.currentValue / this.targetValue) * 100));
});

healthGoalSchema.set('toJSON', { virtuals: true });
healthGoalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('HealthGoal', healthGoalSchema);
