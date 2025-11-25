const Reminder = require('../models/Reminder');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// @desc    Create medicine reminder
// @route   POST /api/reminders
// @access  Private (Patient)
exports.createReminder = async (req, res) => {
  try {
    const { medicineName, dosage, frequency, timing, startDate, endDate, notes, emailNotification } = req.body;

    const reminder = await Reminder.create({
      patient: req.user._id,
      medicineName,
      dosage,
      frequency,
      timing,
      startDate,
      endDate,
      notes,
      emailNotification
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      reminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating reminder'
    });
  }
};

// @desc    Get all reminders for logged in patient
// @route   GET /api/reminders
// @access  Private (Patient)
exports.getMyReminders = async (req, res) => {
  try {
    const { active } = req.query;
    
    const query = { patient: req.user._id };
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const reminders = await Reminder.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reminders'
    });
  }
};

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private (Patient)
exports.getReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check authorization
    if (reminder.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this reminder'
      });
    }

    res.status(200).json({
      success: true,
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reminder'
    });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private (Patient)
exports.updateReminder = async (req, res) => {
  try {
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check authorization
    if (reminder.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reminder'
      });
    }

    reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating reminder'
    });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private (Patient)
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check authorization
    if (reminder.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reminder'
      });
    }

    await reminder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting reminder'
    });
  }
};

// @desc    Toggle reminder active status
// @route   PUT /api/reminders/:id/toggle
// @access  Private (Patient)
exports.toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Check authorization
    if (reminder.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    res.status(200).json({
      success: true,
      message: `Reminder ${reminder.isActive ? 'activated' : 'deactivated'}`,
      reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling reminder'
    });
  }
};

// @desc    Send reminder emails (called by cron job)
// @route   POST /api/reminders/send
// @access  Private (Internal/Cron)
exports.sendReminderEmails = async (req, res) => {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Find active reminders that match current time
    const reminders = await Reminder.find({
      isActive: true,
      emailNotification: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      timing: currentTime
    }).populate('patient', 'name email');

    let sentCount = 0;

    for (const reminder of reminders) {
      try {
        await sendEmail({
          email: reminder.patient.email,
          subject: `Medicine Reminder: ${reminder.medicineName}`,
          html: emailTemplates.medicineReminder(
            reminder.patient.name,
            reminder.medicineName,
            reminder.dosage,
            currentTime
          )
        });

        reminder.lastSent = now;
        await reminder.save();
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send reminder to ${reminder.patient.email}:`, emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Sent ${sentCount} reminder emails`
    });
  } catch (error) {
    console.error('Send reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reminders'
    });
  }
};