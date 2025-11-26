const Allergy = require('../models/Allergy');
const Prescription = require('../models/Prescription');

// @desc    Add allergy
// @route   POST /api/allergies
// @access  Private
exports.addAllergy = async (req, res) => {
  try {
    const allergyData = {
      ...req.body,
      user: req.user.role === 'patient' ? req.user._id : req.body.userId
    };

    const allergy = await Allergy.create(allergyData);

    res.status(201).json({
      success: true,
      allergy
    });
  } catch (error) {
    console.error('Add allergy error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get user allergies
// @route   GET /api/allergies
// @access  Private
exports.getAllergies = async (req, res) => {
  try {
    const userId = req.user.role === 'patient' ? req.user._id : req.query.userId;
    const { category, severity, isActive } = req.query;
    
    const filter = { user: userId };
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const allergies = await Allergy.find(filter)
      .populate('diagnosedBy', 'name specialization')
      .sort({ severity: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: allergies.length,
      allergies
    });
  } catch (error) {
    console.error('Get allergies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get critical allergies (severe and life-threatening)
// @route   GET /api/allergies/critical
// @access  Private
exports.getCriticalAllergies = async (req, res) => {
  try {
    const userId = req.user.role === 'patient' ? req.user._id : req.query.userId;
    
    const allergies = await Allergy.find({
      user: userId,
      severity: { $in: ['severe', 'life-threatening'] },
      isActive: true
    })
      .select('allergen category severity reactions');

    res.status(200).json({
      success: true,
      count: allergies.length,
      allergies
    });
  } catch (error) {
    console.error('Get critical allergies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Check medication against allergies
// @route   POST /api/allergies/check-medication
// @access  Private
exports.checkMedicationAllergy = async (req, res) => {
  try {
    const { medicationName, userId } = req.body;
    const patientId = userId || req.user._id;

    const allergies = await Allergy.find({
      user: patientId,
      category: 'medication',
      isActive: true
    });

    // Simple name matching (in real app, use drug database)
    const conflicts = allergies.filter(allergy => 
      medicationName.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
      allergy.allergen.toLowerCase().includes(medicationName.toLowerCase())
    );

    res.status(200).json({
      success: true,
      hasConflict: conflicts.length > 0,
      conflicts: conflicts.map(a => ({
        allergen: a.allergen,
        severity: a.severity,
        reactions: a.reactions
      }))
    });
  } catch (error) {
    console.error('Check medication allergy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update allergy
// @route   PUT /api/allergies/:id
// @access  Private
exports.updateAllergy = async (req, res) => {
  try {
    let allergy = await Allergy.findById(req.params.id);

    if (!allergy) {
      return res.status(404).json({
        success: false,
        message: 'Allergy record not found'
      });
    }

    // Check ownership
    if (allergy.user.toString() !== req.user._id.toString() && req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    allergy = await Allergy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      allergy
    });
  } catch (error) {
    console.error('Update allergy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete allergy
// @route   DELETE /api/allergies/:id
// @access  Private
exports.deleteAllergy = async (req, res) => {
  try {
    const allergy = await Allergy.findById(req.params.id);

    if (!allergy) {
      return res.status(404).json({
        success: false,
        message: 'Allergy record not found'
      });
    }

    // Check ownership
    if (allergy.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await allergy.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Allergy record deleted'
    });
  } catch (error) {
    console.error('Delete allergy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Record allergic reaction
// @route   POST /api/allergies/:id/reaction
// @access  Private
exports.recordReaction = async (req, res) => {
  try {
    const { description } = req.body;
    
    const allergy = await Allergy.findById(req.params.id);

    if (!allergy) {
      return res.status(404).json({
        success: false,
        message: 'Allergy record not found'
      });
    }

    allergy.lastReaction = {
      date: new Date(),
      description
    };

    await allergy.save();

    res.status(200).json({
      success: true,
      allergy
    });
  } catch (error) {
    console.error('Record reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
