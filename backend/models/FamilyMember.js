const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  primaryUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide family member name'],
    trim: true
  },
  relationship: {
    type: String,
    required: true,
    enum: ['spouse', 'child', 'parent', 'sibling', 'grandparent', 'other']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  phoneNumber: {
    type: String
  },
  email: {
    type: String,
    lowercase: true
  },
  profilePicture: {
    type: String
  },
  medicalConditions: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'managed']
    }
  }],
  allergies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Allergy'
  }],
  vaccinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vaccination'
  }],
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for age
familyMemberSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

familyMemberSchema.set('toJSON', { virtuals: true });
familyMemberSchema.set('toObject', { virtuals: true });

// Indexes
familyMemberSchema.index({ primaryUser: 1, isActive: 1 });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
