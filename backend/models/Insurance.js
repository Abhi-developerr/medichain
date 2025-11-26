const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  policyType: {
    type: String,
    enum: ['individual', 'family', 'group', 'senior-citizen'],
    required: true
  },
  coverageAmount: {
    type: Number,
    required: true
  },
  premium: {
    amount: Number,
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually']
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'active'
  },
  dependents: [{
    name: String,
    relationship: String,
    dateOfBirth: Date
  }],
  claims: [{
    claimId: String,
    date: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'processing']
    },
    description: String,
    approvedAmount: Number
  }],
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Virtual for remaining coverage
insuranceSchema.virtual('remainingCoverage').get(function() {
  const claimedAmount = this.claims
    .filter(claim => claim.status === 'approved')
    .reduce((sum, claim) => sum + (claim.approvedAmount || 0), 0);
  return this.coverageAmount - claimedAmount;
});

insuranceSchema.set('toJSON', { virtuals: true });
insuranceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Insurance', insuranceSchema);
