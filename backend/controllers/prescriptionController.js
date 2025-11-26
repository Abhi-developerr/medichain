const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Allergy = require('../models/Allergy');
const { createNotification } = require('./notificationController');

// Drug interaction database (simplified - in production, use a comprehensive drug database API)
const DRUG_INTERACTIONS = {
  'warfarin': ['aspirin', 'ibuprofen', 'naproxen'],
  'aspirin': ['warfarin', 'ibuprofen'],
  'metformin': ['alcohol'],
  'lisinopril': ['potassium supplements'],
  'simvastatin': ['grapefruit juice']
};

// @desc    Check medication interactions
// @route   POST /api/prescriptions/check-interactions
// @access  Private (Doctor)
exports.checkMedicationInteractions = async (req, res) => {
  try {
    const { medications, patientId } = req.body;

    if (!medications || !Array.isArray(medications)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide medications array'
      });
    }

    const warnings = [];
    const errors = [];

    // Check medication allergies
    const allergies = await Allergy.find({
      user: patientId,
      category: 'medication',
      isActive: true
    }).select('allergen severity reactions');

    for (const med of medications) {
      const medName = med.name.toLowerCase();
      
      // Check against allergies
      for (const allergy of allergies) {
        if (medName.includes(allergy.allergen.toLowerCase()) || 
            allergy.allergen.toLowerCase().includes(medName)) {
          errors.push({
            type: 'allergy',
            severity: allergy.severity,
            medication: med.name,
            allergen: allergy.allergen,
            reactions: allergy.reactions,
            message: `CRITICAL: Patient is allergic to ${allergy.allergen} (${allergy.severity})`
          });
        }
      }

      // Check drug-drug interactions
      for (const otherMed of medications) {
        if (med.name !== otherMed.name) {
          const interactions = DRUG_INTERACTIONS[medName] || [];
          if (interactions.some(int => otherMed.name.toLowerCase().includes(int))) {
            warnings.push({
              type: 'drug-interaction',
              medication1: med.name,
              medication2: otherMed.name,
              message: `Warning: Potential interaction between ${med.name} and ${otherMed.name}`
            });
          }
        }
      }
    }

    // Check current prescriptions for interactions
    const currentPrescriptions = await Prescription.find({
      patient: patientId,
      status: 'active'
    }).select('medications');

    for (const prescription of currentPrescriptions) {
      for (const currentMed of prescription.medications) {
        for (const newMed of medications) {
          const currentName = currentMed.name.toLowerCase();
          const newName = newMed.name.toLowerCase();
          const interactions = DRUG_INTERACTIONS[currentName] || [];
          
          if (interactions.some(int => newName.includes(int))) {
            warnings.push({
              type: 'existing-medication-interaction',
              newMedication: newMed.name,
              existingMedication: currentMed.name,
              message: `Warning: ${newMed.name} may interact with current medication ${currentMed.name}`
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      safe: errors.length === 0,
      hasWarnings: warnings.length > 0,
      errors,
      warnings,
      summary: {
        totalChecks: medications.length,
        criticalIssues: errors.length,
        warnings: warnings.length
      }
    });
  } catch (error) {
    console.error('Check medication interactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

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

    // Auto-check for interactions before creating
    const interactionCheck = await exports.checkMedicationInteractions({
      body: { medications, patientId: patient }
    }, { status: () => ({ json: (data) => data }) });

    if (interactionCheck && interactionCheck.errors && interactionCheck.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Critical medication conflicts detected',
        conflicts: interactionCheck.errors
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
