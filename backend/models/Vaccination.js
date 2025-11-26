const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vaccineName: {
    type: String,
    required: [true, 'Please provide vaccine name'],
    trim: true
  },
  diseaseTarget: {
    type: String,
    required: true,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  batchNumber: {
    type: String,
    trim: true
  },
  dateAdministered: {
    type: Date,
    required: [true, 'Please provide administration date']
  },
  nextDueDate: {
    type: Date
  },
  administeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: String,
    trim: true
  },
  doseNumber: {
    type: Number,
    default: 1
  },
  totalDoses: {
    type: Number,
    default: 1
  },
  sideEffects: {
    type: String
  },
  notes: {
    type: String
  },
  certificateUrl: {
    type: String // File ID for vaccination certificate
  },
  status: {
    type: String,
    enum: ['completed', 'upcoming', 'overdue'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Update status based on dates
vaccinationSchema.pre('save', function(next) {
  if (this.nextDueDate) {
    const today = new Date();
    if (this.nextDueDate < today) {
      this.status = 'overdue';
    } else if (this.nextDueDate > today) {
      this.status = 'upcoming';
    }
  }
  next();
});

// Indexes
vaccinationSchema.index({ user: 1, dateAdministered: -1 });
vaccinationSchema.index({ nextDueDate: 1, status: 1 });

module.exports = mongoose.model('Vaccination', vaccinationSchema);
