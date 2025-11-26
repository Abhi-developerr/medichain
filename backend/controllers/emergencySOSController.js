const EmergencySOS = require('../models/EmergencySOS');

// Get or create emergency profile
exports.getProfile = async (req, res) => {
  try {
    let profile = await EmergencySOS.findOne({ user: req.user._id });
    
    if (!profile) {
      profile = await EmergencySOS.create({
        user: req.user._id,
        emergencyContacts: [],
        sosAlerts: []
      });
    }
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update medical ID
exports.updateMedicalID = async (req, res) => {
  try {
    let profile = await EmergencySOS.findOne({ user: req.user._id });
    
    if (!profile) {
      profile = await EmergencySOS.create({ user: req.user._id });
    }
    
    profile.medicalID = req.body;
    await profile.save();
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add emergency contact
exports.addContact = async (req, res) => {
  try {
    let profile = await EmergencySOS.findOne({ user: req.user._id });
    
    if (!profile) {
      profile = await EmergencySOS.create({ user: req.user._id });
    }
    
    // If this is primary, unset others
    if (req.body.isPrimary) {
      profile.emergencyContacts.forEach(contact => {
        contact.isPrimary = false;
      });
    }
    
    profile.emergencyContacts.push(req.body);
    await profile.save();
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update emergency contact
exports.updateContact = async (req, res) => {
  try {
    const profile = await EmergencySOS.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    const contact = profile.emergencyContacts.id(req.params.contactId);
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    Object.assign(contact, req.body);
    await profile.save();
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete emergency contact
exports.deleteContact = async (req, res) => {
  try {
    const profile = await EmergencySOS.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    profile.emergencyContacts.id(req.params.contactId).deleteOne();
    await profile.save();
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Trigger SOS alert
exports.triggerSOS = async (req, res) => {
  try {
    const { type, description, location } = req.body;
    
    let profile = await EmergencySOS.findOne({ user: req.user._id });
    
    if (!profile) {
      profile = await EmergencySOS.create({ user: req.user._id });
    }
    
    const sosAlert = {
      type,
      description,
      location,
      status: 'active',
      notifiedContacts: []
    };
    
    // Notify all emergency contacts if auto-notify is enabled
    if (profile.settings.autoNotify) {
      profile.emergencyContacts.forEach(contact => {
        sosAlert.notifiedContacts.push({
          contact: contact,
          notifiedAt: new Date(),
          acknowledged: false
        });
        // In production, send actual SMS/email notifications here
      });
    }
    
    profile.sosAlerts.push(sosAlert);
    await profile.save();
    
    res.json({ 
      success: true, 
      message: 'SOS alert triggered successfully',
      alert: sosAlert 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update SOS alert status
exports.updateSOSStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const profile = await EmergencySOS.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    const alert = profile.sosAlerts.id(req.params.alertId);
    
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    
    alert.status = status;
    if (notes) alert.notes = notes;
    if (status === 'resolved') alert.resolvedAt = new Date();
    
    await profile.save();
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quick access info
exports.updateQuickAccess = async (req, res) => {
  try {
    let profile = await EmergencySOS.findOne({ user: req.user._id });
    
    if (!profile) {
      profile = await EmergencySOS.create({ user: req.user._id });
    }
    
    profile.quickAccessInfo = req.body;
    await profile.save();
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    let profile = await EmergencySOS.findOne({ user: req.user._id });
    
    if (!profile) {
      profile = await EmergencySOS.create({ user: req.user._id });
    }
    
    profile.settings = { ...profile.settings, ...req.body };
    await profile.save();
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get SOS history
exports.getSOSHistory = async (req, res) => {
  try {
    const profile = await EmergencySOS.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.json({ success: true, history: [] });
    }
    
    res.json({ success: true, history: profile.sosAlerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get public medical ID (for emergency responders)
exports.getPublicMedicalID = async (req, res) => {
  try {
    const profile = await EmergencySOS.findOne({ user: req.params.userId })
      .select('medicalID emergencyContacts quickAccessInfo')
      .populate('user', 'name phone');
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Medical ID not found' });
    }
    
    res.json({ success: true, medicalID: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
