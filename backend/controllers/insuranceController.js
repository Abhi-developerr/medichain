const Insurance = require('../models/Insurance');
const mongoose = require('mongoose');

// Get all insurance policies for a user
exports.getInsurancePolicies = async (req, res) => {
  try {
    const policies = await Insurance.find({ user: req.user._id }).sort({ startDate: -1 });
    res.json({ policies });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new insurance policy
exports.createInsurance = async (req, res) => {
  try {
    const { policyNumber, provider, policyType, coverageAmount, premium, startDate, endDate, dependents } = req.body;

    const insurance = new Insurance({
      user: req.user._id,
      policyNumber,
      provider,
      policyType,
      coverageAmount,
      premium,
      startDate,
      endDate,
      dependents
    });

    await insurance.save();
    res.status(201).json({ message: 'Insurance policy created successfully', insurance });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create insurance policy', error: error.message });
  }
};

// Get a single insurance policy
exports.getInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findOne({ _id: req.params.id, user: req.user._id });

    if (!insurance) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    res.json({ insurance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update insurance policy
exports.updateInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findOne({ _id: req.params.id, user: req.user._id });

    if (!insurance) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    Object.assign(insurance, req.body);
    await insurance.save();

    res.json({ message: 'Insurance policy updated successfully', insurance });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update insurance policy', error: error.message });
  }
};

// Delete insurance policy
exports.deleteInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!insurance) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    res.json({ message: 'Insurance policy deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete insurance policy', error: error.message });
  }
};

// Add a claim to insurance
exports.addClaim = async (req, res) => {
  try {
    const { claimId, amount, description } = req.body;
    const insurance = await Insurance.findOne({ _id: req.params.id, user: req.user._id });

    if (!insurance) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    insurance.claims.push({
      claimId,
      date: new Date(),
      amount,
      status: 'submitted',
      description
    });

    await insurance.save();
    res.json({ message: 'Claim added successfully', insurance });
  } catch (error) {
    res.status(400).json({ message: 'Failed to add claim', error: error.message });
  }
};

// Update claim status
exports.updateClaimStatus = async (req, res) => {
  try {
    const { claimId, status, approvedAmount } = req.body;
    const insurance = await Insurance.findOne({ _id: req.params.id, user: req.user._id });

    if (!insurance) {
      return res.status(404).json({ message: 'Insurance policy not found' });
    }

    const claim = insurance.claims.find(c => c.claimId === claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;
    if (approvedAmount) {
      claim.approvedAmount = approvedAmount;
    }

    await insurance.save();
    res.json({ message: 'Claim status updated successfully', insurance });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update claim status', error: error.message });
  }
};

// Get insurance statistics
exports.getInsuranceStats = async (req, res) => {
  try {
    const policies = await Insurance.find({ user: req.user._id });

    const stats = {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.status === 'active').length,
      totalCoverage: policies.reduce((sum, p) => sum + p.coverageAmount, 0),
      totalClaims: policies.reduce((sum, p) => sum + p.claims.length, 0),
      approvedClaims: policies.reduce((sum, p) => 
        sum + p.claims.filter(c => c.status === 'approved').length, 0),
      pendingClaims: policies.reduce((sum, p) => 
        sum + p.claims.filter(c => c.status === 'submitted' || c.status === 'processing').length, 0)
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
