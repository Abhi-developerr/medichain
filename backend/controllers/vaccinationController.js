const Vaccination = require('../models/Vaccination');
const mongoose = require('mongoose');

// @desc    Add vaccination record
// @route   POST /api/vaccinations
// @access  Private
exports.addVaccination = async (req, res) => {
  try {
    const vaccinationData = {
      ...req.body,
      user: req.user.role === 'patient' ? req.user._id : req.body.userId
    };

    const vaccination = await Vaccination.create(vaccinationData);

    res.status(201).json({
      success: true,
      vaccination
    });
  } catch (error) {
    console.error('Add vaccination error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get user vaccinations
// @route   GET /api/vaccinations
// @access  Private
exports.getVaccinations = async (req, res) => {
  try {
    const userId = req.user.role === 'patient' ? req.user._id : req.query.userId;
    
    const vaccinations = await Vaccination.find({ user: userId })
      .populate('administeredBy', 'name specialization')
      .sort({ dateAdministered: -1 });

    res.status(200).json({
      success: true,
      count: vaccinations.length,
      vaccinations
    });
  } catch (error) {
    console.error('Get vaccinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get upcoming vaccinations
// @route   GET /api/vaccinations/upcoming
// @access  Private
exports.getUpcomingVaccinations = async (req, res) => {
  try {
    const userId = req.user.role === 'patient' ? req.user._id : req.query.userId;
    
    const vaccinations = await Vaccination.find({
      user: userId,
      status: { $in: ['upcoming', 'overdue'] }
    })
      .sort({ nextDueDate: 1 });

    res.status(200).json({
      success: true,
      count: vaccinations.length,
      vaccinations
    });
  } catch (error) {
    console.error('Get upcoming vaccinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update vaccination
// @route   PUT /api/vaccinations/:id
// @access  Private
exports.updateVaccination = async (req, res) => {
  try {
    let vaccination = await Vaccination.findById(req.params.id);

    if (!vaccination) {
      return res.status(404).json({
        success: false,
        message: 'Vaccination record not found'
      });
    }

    // Check ownership
    if (vaccination.user.toString() !== req.user._id.toString() && req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    vaccination = await Vaccination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      vaccination
    });
  } catch (error) {
    console.error('Update vaccination error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete vaccination
// @route   DELETE /api/vaccinations/:id
// @access  Private
exports.deleteVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);

    if (!vaccination) {
      return res.status(404).json({
        success: false,
        message: 'Vaccination record not found'
      });
    }

    // Check ownership
    if (vaccination.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await vaccination.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vaccination record deleted'
    });
  } catch (error) {
    console.error('Delete vaccination error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get vaccination statistics
// @route   GET /api/vaccinations/stats
// @access  Private
exports.getVaccinationStats = async (req, res) => {
  try {
    const userId = req.user.role === 'patient' ? req.user._id : req.query.userId;

    const stats = await Vaccination.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Vaccination.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      total,
      stats
    });
  } catch (error) {
    console.error('Get vaccination stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
