const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
exports.createPrescription = async (req, res) => {
  try {
    const { patient, diagnosis, medications, labTests, generalInstructions, followUpDate, followUpInstructions, validUntil, appointment } = req.body;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create prescriptions'
      });
    }

    const prescription = await Prescription.create({
      patient,
      doctor: req.user._id,
      appointment,
      diagnosis,
      medications,
      labTests,
      generalInstructions,
      followUpDate,
      followUpInstructions,
      validUntil
    });

    await prescription.populate('patient', 'name email');
    await prescription.populate('doctor', 'name specialization');

    // Send notification to patient
    await createNotification({
      user: patient,
      type: 'prescription_created',
      title: 'New Prescription',
      message: `Dr. ${req.user.name} has prescribed medications for you`,
      relatedId: prescription._id
    });

    res.status(201).json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating prescription'
    });
  }
};

// @desc    Get prescriptions
// @route   GET /api/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'name email phoneNumber')
      .populate('doctor', 'name specialization')
      .populate('appointment', 'title appointmentDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescriptions'
    });
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phoneNumber')
      .populate('doctor', 'name specialization licenseNumber')
      .populate('appointment', 'title appointmentDate');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && prescription.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this prescription'
      });
    }

    if (req.user.role === 'doctor' && prescription.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this prescription'
      });
    }

    res.status(200).json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescription'
    });
  }
};

// @desc    Update prescription status
// @route   PUT /api/prescriptions/:id/status
// @access  Private (Doctor only)
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    if (prescription.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this prescription'
      });
    }

    prescription.status = status;
    await prescription.save();

    res.status(200).json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error('Update prescription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating prescription'
    });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Doctor only)
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    if (prescription.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this prescription'
      });
    }

    await prescription.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting prescription'
    });
  }
};
