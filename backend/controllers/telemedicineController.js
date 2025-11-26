const Telemedicine = require('../models/Telemedicine');

// Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const query = { [user.role === 'doctor' ? 'doctor' : 'patient']: req.user._id };
    
    if (req.query.status) query.status = req.query.status;
    if (req.query.upcoming) {
      query.appointmentDate = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'ongoing'] };
    }
    
    const appointments = await Telemedicine.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone specialty')
      .sort({ appointmentDate: -1 });
    
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Telemedicine.create({
      ...req.body,
      patient: req.user.role === 'patient' ? req.user._id : req.body.patient,
      meetingLink: `https://meet.medichain.com/${Date.now()}`
    });
    
    await appointment.populate('patient doctor');
    
    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single appointment
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Telemedicine.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone specialty');
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Telemedicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patient doctor');
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start session
exports.startSession = async (req, res) => {
  try {
    const appointment = await Telemedicine.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    appointment.status = 'ongoing';
    await appointment.save();
    
    res.json({ success: true, appointment, meetingLink: appointment.meetingLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete session
exports.completeSession = async (req, res) => {
  try {
    const { diagnosis, prescriptions, labTestsOrdered, sessionNotes, followUp } = req.body;
    
    const appointment = await Telemedicine.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    appointment.status = 'completed';
    appointment.diagnosis = diagnosis;
    appointment.prescriptions = prescriptions;
    appointment.labTestsOrdered = labTestsOrdered;
    appointment.sessionNotes = sessionNotes;
    appointment.followUp = followUp;
    
    await appointment.save();
    
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add rating
exports.addRating = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    
    const appointment = await Telemedicine.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    appointment.rating = {
      score,
      feedback,
      ratedAt: new Date()
    };
    
    await appointment.save();
    
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const query = { [req.user.role === 'doctor' ? 'doctor' : 'patient']: req.user._id };
    
    const total = await Telemedicine.countDocuments(query);
    const completed = await Telemedicine.countDocuments({ ...query, status: 'completed' });
    const upcoming = await Telemedicine.countDocuments({
      ...query,
      status: 'scheduled',
      appointmentDate: { $gte: new Date() }
    });
    const cancelled = await Telemedicine.countDocuments({ ...query, status: 'cancelled' });
    
    const avgRating = await Telemedicine.aggregate([
      { $match: { ...query, 'rating.score': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$rating.score' } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        total,
        completed,
        upcoming,
        cancelled,
        averageRating: avgRating[0]?.avg || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
