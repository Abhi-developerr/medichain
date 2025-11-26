const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testName: {
    type: String,
    required: true,
    trim: true
  },
  testType: {
    type: String,
    enum: ['blood', 'urine', 'imaging', 'biopsy', 'genetic', 'other'],
    required: true
  },
  labName: {
    type: String,
    required: true,
    trim: true
  },
  testDate: {
    type: Date,
    required: true
  },
  results: [{
    parameter: String,
    value: String,
    unit: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['normal', 'low', 'high', 'critical']
    }
  }],
  overallStatus: {
    type: String,
    enum: ['normal', 'abnormal', 'pending', 'critical'],
    default: 'pending'
  },
  doctorNotes: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String
  },
  fileId: {
    type: String
  },
  nextTestDate: {
    type: Date
  },
  criticalFlag: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabTest', labTestSchema);
