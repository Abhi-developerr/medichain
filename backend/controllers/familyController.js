const FamilyMember = require('../models/FamilyMember');
const Allergy = require('../models/Allergy');
const Vaccination = require('../models/Vaccination');

// @desc    Add family member
// @route   POST /api/family
// @access  Private (Patient)
exports.addFamilyMember = async (req, res) => {
  try {
    const familyMemberData = {
      ...req.body,
      primaryUser: req.user._id
    };

    const familyMember = await FamilyMember.create(familyMemberData);

    res.status(201).json({
      success: true,
      familyMember
    });
  } catch (error) {
    console.error('Add family member error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get all family members
// @route   GET /api/family
// @access  Private (Patient)
exports.getFamilyMembers = async (req, res) => {
  try {
    const familyMembers = await FamilyMember.find({
      primaryUser: req.user._id,
      isActive: true
    })
      .populate('allergies')
      .populate('vaccinations')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: familyMembers.length,
      familyMembers
    });
  } catch (error) {
    console.error('Get family members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get family member by ID
// @route   GET /api/family/:id
// @access  Private
exports.getFamilyMember = async (req, res) => {
  try {
    const familyMember = await FamilyMember.findById(req.params.id)
      .populate('allergies')
      .populate('vaccinations')
      .populate('reports')
      .populate('prescriptions');

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Check ownership
    if (familyMember.primaryUser.toString() !== req.user._id.toString() && req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      familyMember
    });
  } catch (error) {
    console.error('Get family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update family member
// @route   PUT /api/family/:id
// @access  Private
exports.updateFamilyMember = async (req, res) => {
  try {
    let familyMember = await FamilyMember.findById(req.params.id);

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Check ownership
    if (familyMember.primaryUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    familyMember = await FamilyMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('allergies')
      .populate('vaccinations');

    res.status(200).json({
      success: true,
      familyMember
    });
  } catch (error) {
    console.error('Update family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete family member
// @route   DELETE /api/family/:id
// @access  Private
exports.deleteFamilyMember = async (req, res) => {
  try {
    const familyMember = await FamilyMember.findById(req.params.id);

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Check ownership
    if (familyMember.primaryUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Soft delete
    familyMember.isActive = false;
    await familyMember.save();

    res.status(200).json({
      success: true,
      message: 'Family member removed'
    });
  } catch (error) {
    console.error('Delete family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add medical condition to family member
// @route   POST /api/family/:id/conditions
// @access  Private
exports.addMedicalCondition = async (req, res) => {
  try {
    const familyMember = await FamilyMember.findById(req.params.id);

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Check ownership
    if (familyMember.primaryUser.toString() !== req.user._id.toString() && req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    familyMember.medicalConditions.push(req.body);
    await familyMember.save();

    res.status(200).json({
      success: true,
      familyMember
    });
  } catch (error) {
    console.error('Add medical condition error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get family health summary
// @route   GET /api/family/summary
// @access  Private
exports.getFamilyHealthSummary = async (req, res) => {
  try {
    const familyMembers = await FamilyMember.find({
      primaryUser: req.user._id,
      isActive: true
    });

    const summary = {
      totalMembers: familyMembers.length,
      activeConditions: 0,
      totalAllergies: 0,
      upcomingVaccinations: 0
    };

    for (const member of familyMembers) {
      summary.activeConditions += member.medicalConditions.filter(c => c.status === 'active').length;
      summary.totalAllergies += member.allergies.length;
      
      const upcomingVaccs = await Vaccination.countDocuments({
        _id: { $in: member.vaccinations },
        status: 'upcoming'
      });
      summary.upcomingVaccinations += upcomingVaccs;
    }

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get family summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
