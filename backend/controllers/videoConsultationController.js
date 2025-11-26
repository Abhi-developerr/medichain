const VideoConsultation = require('../models/VideoConsultation');
const User = require('../models/User');

// Get all consultations for a user
exports.getConsultations = async (req, res) => {
  try {
    const query = req.user.role === 'doctor' 
      ? { doctor: req.user._id }
      : { patient: req.user._id };
    
    const consultations = await VideoConsultation.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name email specialization')
      .sort({ scheduledDate: -1 });
    
    res.json({ success: true, consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Schedule new consultation
exports.scheduleConsultation = async (req, res) => {
  try {
    const { doctorId, scheduledDate, duration, reason, symptoms, notes } = req.body;
    
    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    // Check for conflicts
    const existingConsultation = await VideoConsultation.findOne({
      doctor: doctorId,
      scheduledDate,
      status: { $in: ['scheduled', 'in-progress'] }
    });
    
    if (existingConsultation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor is not available at this time' 
      });
    }
    
    const consultation = new VideoConsultation({
      patient: req.user._id,
      doctor: doctorId,
      scheduledDate,
      duration: duration || 30,
      reason,
      symptoms: symptoms || [],
      notes
    });
    
    consultation.generateRoomId();
    consultation.meetingLink = `/video-call/${consultation.roomId}`;
    
    await consultation.save();
    await consultation.populate('patient doctor');
    
    res.status(201).json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single consultation
exports.getConsultation = async (req, res) => {
  try {
    const consultation = await VideoConsultation.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');
    
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }
    
    // Check access
    if (consultation.patient._id.toString() !== req.user._id.toString() &&
        consultation.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start consultation
exports.startConsultation = async (req, res) => {
  try {
    const consultation = await VideoConsultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }
    
    consultation.status = 'in-progress';
    consultation.startTime = new Date();
    
    await consultation.save();
    
    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// End consultation
exports.endConsultation = async (req, res) => {
  try {
    const { doctorNotes, prescription } = req.body;
    
    const consultation = await VideoConsultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }
    
    consultation.status = 'completed';
    consultation.endTime = new Date();
    consultation.doctorNotes = doctorNotes;
    consultation.prescription = prescription;
    
    await consultation.save();
    
    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel consultation
exports.cancelConsultation = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    
    const consultation = await VideoConsultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }
    
    consultation.status = 'cancelled';
    consultation.cancelReason = cancelReason;
    
    await consultation.save();
    
    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Rate consultation
exports.rateConsultation = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    const consultation = await VideoConsultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }
    
    if (consultation.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only patient can rate' });
    }
    
    consultation.rating = rating;
    consultation.feedback = feedback;
    
    await consultation.save();
    
    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get consultation statistics
exports.getConsultationStats = async (req, res) => {
  try {
    const query = req.user.role === 'doctor' 
      ? { doctor: req.user._id }
      : { patient: req.user._id };
    
    const consultations = await VideoConsultation.find(query);
    
    const stats = {
      total: consultations.length,
      scheduled: consultations.filter(c => c.status === 'scheduled').length,
      completed: consultations.filter(c => c.status === 'completed').length,
      cancelled: consultations.filter(c => c.status === 'cancelled').length,
      upcoming: consultations.filter(c => c.isUpcoming).length,
      averageRating: consultations
        .filter(c => c.rating)
        .reduce((sum, c) => sum + c.rating, 0) / 
        consultations.filter(c => c.rating).length || 0
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
