const mongoose = require('mongoose');

const allergySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allergen: {
    type: String,
    required: [true, 'Please provide allergen name'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['medication', 'food', 'environmental', 'other']
  },
  severity: {
    type: String,
    required: true,
    enum: ['mild', 'moderate', 'severe', 'life-threatening'],
    default: 'mild'
  },
  reactions: [{
    type: String,
    trim: true
  }],
  diagnosedDate: {
    type: Date
  },
  diagnosedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastReaction: {
    date: Date,
    description: String
  }
}, {
  timestamps: true
});

// Indexes
allergySchema.index({ user: 1, isActive: 1 });
allergySchema.index({ category: 1, severity: 1 });

module.exports = mongoose.model('Allergy', allergySchema);
