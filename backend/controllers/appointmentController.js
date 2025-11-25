const Appointment = require('../models/Appointment');
const { createNotification } = require('./notificationController');

// @desc    Get appointments for user
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const { status, upcoming, past } = req.query;
    
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    if (status) query.status = status;

    const now = new Date();
    if (upcoming === 'true') {
      query.appointmentDate = { $gte: now };
    } else if (past === 'true') {
      query.appointmentDate = { $lt: now };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phoneNumber')
      .populate('doctor', 'name email specialization')
      .populate('relatedReports', 'title reportType')
      .sort({ appointmentDate: upcoming === 'true' ? 1 : -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Patient)
exports.createAppointment = async (req, res) => {
  try {
    const {
      doctor,
      title,
      description,
      appointmentDate,
      duration,
      type,
      location,
      meetingLink,
      notes
    } = req.body;

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      title,
      description,
      appointmentDate,
      duration,
      type,
      location,
      meetingLink,
      notes
    });

    // Notify doctor
    await createNotification(
      doctor,
      'appointment_scheduled',
      'New Appointment Request',
      `${req.user.name} has scheduled an appointment with you`,
      null,
      req.user._id,
      `/appointments`
    );

    await appointment.populate('doctor', 'name email specialization');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating appointment'
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason, completionNotes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Authorization check
    const isAuthorized = 
      appointment.patient.toString() === req.user._id.toString() ||
      appointment.doctor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    appointment.status = status;
    
    if (status === 'cancelled') {
      appointment.cancelledBy = req.user._id;
      appointment.cancellationReason = cancellationReason;
      
      // Notify the other party
      const notifyUserId = appointment.patient.toString() === req.user._id.toString() 
        ? appointment.doctor 
        : appointment.patient;
        
      await createNotification(
        notifyUserId,
        'appointment_cancelled',
        'Appointment Cancelled',
        `An appointment has been cancelled`,
        null,
        req.user._id,
        `/appointments`
      );
    } else if (status === 'completed') {
      appointment.completionNotes = completionNotes;
    } else if (status === 'confirmed') {
      // Notify patient
      await createNotification(
        appointment.patient,
        'appointment_confirmed',
        'Appointment Confirmed',
        `Your appointment has been confirmed by Dr. ${req.user.name}`,
        null,
        req.user._id,
        `/appointments`
      );
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment status updated',
      appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment'
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Only patient can delete
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment'
    });
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private
exports.getAppointmentStats = async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role === 'patient') {
      matchQuery.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      matchQuery.doctor = req.user._id;
    }

    const total = await Appointment.countDocuments(matchQuery);
    
    const upcoming = await Appointment.countDocuments({
      ...matchQuery,
      appointmentDate: { $gte: new Date() },
      status: { $nin: ['cancelled', 'completed'] }
    });

    const byStatus = await Appointment.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        upcoming,
        byStatus
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};
