const MedicationTracker = require('../models/MedicationTracker');

// Get all medications
exports.getMedications = async (req, res) => {
  try {
    const medications = await MedicationTracker.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, medications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new medication
exports.addMedication = async (req, res) => {
  try {
    const medicationData = {
      ...req.body,
      user: req.user._id
    };
    
    const medication = await MedicationTracker.create(medicationData);
    
    res.status(201).json({ success: true, medication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single medication
exports.getMedication = async (req, res) => {
  try {
    const medication = await MedicationTracker.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    
    res.json({ success: true, medication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update medication
exports.updateMedication = async (req, res) => {
  try {
    const medication = await MedicationTracker.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    
    res.json({ success: true, medication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete medication
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await MedicationTracker.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    
    res.json({ success: true, message: 'Medication deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Log adherence (take medication)
exports.logAdherence = async (req, res) => {
  try {
    const { time, taken, notes } = req.body;
    
    const medication = await MedicationTracker.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    
    medication.adherenceLog.push({
      date: new Date(),
      time,
      taken,
      notes
    });
    
    // Update pills remaining if taken
    if (taken && medication.pillsRemaining) {
      medication.pillsRemaining -= 1;
    }
    
    // Update schedule
    const scheduleItem = medication.schedule.find(s => s.time === time);
    if (scheduleItem) {
      scheduleItem.taken = taken;
      scheduleItem.lastTaken = new Date();
    }
    
    await medication.save();
    
    res.json({ success: true, medication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update medication status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const medication = await MedicationTracker.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    );
    
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication not found' });
    }
    
    res.json({ success: true, medication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get medication statistics
exports.getMedicationStats = async (req, res) => {
  try {
    const medications = await MedicationTracker.find({ user: req.user._id });
    
    const stats = {
      total: medications.length,
      active: medications.filter(m => m.status === 'active').length,
      completed: medications.filter(m => m.status === 'completed').length,
      paused: medications.filter(m => m.status === 'paused').length,
      needsRefill: medications.filter(m => m.needsRefill).length,
      averageAdherence: medications.reduce((sum, m) => sum + m.adherenceRate, 0) / medications.length || 0
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get due medications
exports.getDueMedications = async (req, res) => {
  try {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const medications = await MedicationTracker.find({
      user: req.user._id,
      status: 'active',
      'schedule.time': { $lte: currentTime },
      'schedule.taken': false
    });
    
    res.json({ success: true, medications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
