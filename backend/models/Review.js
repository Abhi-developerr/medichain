const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  professionalism: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  communication: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  punctuality: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  thoroughness: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  doctorResponse: {
    message: String,
    respondedAt: Date
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one review per patient per appointment
reviewSchema.index({ patient: 1, appointment: 1 }, { unique: true, sparse: true });
reviewSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
