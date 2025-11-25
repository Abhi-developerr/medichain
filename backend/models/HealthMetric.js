const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metricType: {
    type: String,
    enum: ['blood-pressure', 'blood-sugar', 'weight', 'heart-rate', 'temperature', 'oxygen-level', 'bmi', 'other'],
    required: true
  },
  value: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  systolic: Number, // For blood pressure
  diastolic: Number, // For blood pressure
  recordedAt: {
    type: Date,
    default: Date.now
  },
  notes: String,
  tags: [String],
  isAbnormal: {
    type: Boolean,
    default: false
  },
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }
}, {
  timestamps: true
});

// Indexes
healthMetricSchema.index({ user: 1, recordedAt: -1 });
healthMetricSchema.index({ metricType: 1 });

module.exports = mongoose.model('HealthMetric', healthMetricSchema);
