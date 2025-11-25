const EmergencyContact = require('../models/EmergencyContact');

// @desc    Get all emergency contacts for user
// @route   GET /api/emergency-contacts
// @access  Private
exports.getEmergencyContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user._id })
      .sort({ isPrimary: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency contacts'
    });
  }
};

// @desc    Add emergency contact
// @route   POST /api/emergency-contacts
// @access  Private
exports.addEmergencyContact = async (req, res) => {
  try {
    const { name, relationship, phoneNumber, email, address, isPrimary, canAccessReports, notes } = req.body;

    // If setting as primary, remove primary from others
    if (isPrimary) {
      await EmergencyContact.updateMany(
        { user: req.user._id },
        { isPrimary: false }
      );
    }

    const contact = await EmergencyContact.create({
      user: req.user._id,
      name,
      relationship,
      phoneNumber,
      email,
      address,
      isPrimary,
      canAccessReports,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      contact
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding emergency contact'
    });
  }
};

// @desc    Update emergency contact
// @route   PUT /api/emergency-contacts/:id
// @access  Private
exports.updateEmergencyContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    // If setting as primary, remove primary from others
    if (req.body.isPrimary && !contact.isPrimary) {
      await EmergencyContact.updateMany(
        { user: req.user._id, _id: { $ne: contact._id } },
        { isPrimary: false }
      );
    }

    Object.assign(contact, req.body);
    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Emergency contact updated successfully',
      contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating emergency contact'
    });
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/emergency-contacts/:id
// @access  Private
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting emergency contact'
    });
  }
};
