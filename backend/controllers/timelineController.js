const Report = require('../models/Report');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Vaccination = require('../models/Vaccination');
const Allergy = require('../models/Allergy');
const HealthMetric = require('../models/HealthMetric');

// @desc    Get comprehensive medical timeline
// @route   GET /api/timeline
// @access  Private
exports.getMedicalTimeline = async (req, res) => {
  try {
    const userId = req.user.role === 'patient' ? req.user._id : req.query.userId;
    const { startDate, endDate, type, limit = 50 } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const timeline = [];

    // Fetch reports
    if (!type || type === 'report') {
      try {
        const reports = await Report.find({
          patient: userId,
          ...(Object.keys(dateFilter).length && { uploadDate: dateFilter })
        })
          .populate('patient', 'name')
          .select('title reportType uploadDate description')
          .lean();

        timeline.push(...reports.map(r => ({
          type: 'report',
          date: r.uploadDate || new Date(),
          title: r.title,
          category: r.reportType,
          description: r.description,
          icon: 'FileText',
          color: 'blue',
          data: r
        })));
      } catch (error) {
        console.error('Error fetching reports for timeline:', error);
      }
    }

    // Fetch prescriptions
    if (!type || type === 'prescription') {
      try {
        const prescriptions = await Prescription.find({
          patient: userId,
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
        })
          .populate('doctor', 'name specialization')
          .select('medications diagnosis createdAt')
          .lean();

        timeline.push(...prescriptions.map(p => ({
          type: 'prescription',
          date: p.createdAt || new Date(),
          title: `Prescription - ${p.medications?.length || 0} medication(s)`,
          category: p.diagnosis,
          description: p.medications?.map(m => m.name).join(', ') || 'N/A',
          icon: 'Pill',
          color: 'green',
          data: p
        })));
      } catch (error) {
        console.error('Error fetching prescriptions for timeline:', error);
      }
    }

    // Fetch appointments
    if (!type || type === 'appointment') {
      try {
        const appointments = await Appointment.find({
          patient: userId,
          ...(Object.keys(dateFilter).length && { appointmentDate: dateFilter })
        })
          .populate('doctor', 'name specialization')
          .select('appointmentDate appointmentType reason status')
          .lean();

        timeline.push(...appointments.map(a => ({
          type: 'appointment',
          date: a.appointmentDate || new Date(),
          title: `${a.appointmentType || 'General'} Appointment`,
          category: a.reason,
          description: `Status: ${a.status}`,
          icon: 'Calendar',
          color: 'purple',
          data: a
        })));
      } catch (error) {
        console.error('Error fetching appointments for timeline:', error);
      }
    }

    // Fetch vaccinations
    if (!type || type === 'vaccination') {
      try {
        const vaccinations = await Vaccination.find({
          user: userId,
          ...(Object.keys(dateFilter).length && { dateAdministered: dateFilter })
        })
          .populate('administeredBy', 'name')
          .select('vaccineName diseaseTarget dateAdministered doseNumber')
          .lean();

        timeline.push(...vaccinations.map(v => ({
          type: 'vaccination',
          date: v.dateAdministered || new Date(),
          title: v.vaccineName,
          category: v.diseaseTarget,
          description: `Dose ${v.doseNumber}`,
          icon: 'Syringe',
          color: 'teal',
          data: v
        })));
      } catch (error) {
        console.error('Error fetching vaccinations for timeline:', error);
      }
    }

    // Fetch allergies
    if (!type || type === 'allergy') {
      try {
        const allergies = await Allergy.find({
          user: userId,
          ...(Object.keys(dateFilter).length && { diagnosedDate: dateFilter })
        })
          .populate('diagnosedBy', 'name')
          .select('allergen category severity diagnosedDate reactions createdAt')
          .lean();

        timeline.push(...allergies.map(a => ({
          type: 'allergy',
          date: a.diagnosedDate || a.createdAt || new Date(),
          title: `Allergy: ${a.allergen}`,
          category: a.category,
          description: `Severity: ${a.severity}`,
          icon: 'AlertTriangle',
          color: 'red',
          data: a
        })));
      } catch (error) {
        console.error('Error fetching allergies for timeline:', error);
      }
    }

    // Fetch health metrics (significant readings)
    if (!type || type === 'health-metric') {
      try {
        const metrics = await HealthMetric.find({
          user: userId,
          ...(Object.keys(dateFilter).length && { recordedAt: dateFilter })
        })
          .select('metricType value unit recordedAt notes')
          .lean();

        timeline.push(...metrics.map(m => ({
          type: 'health-metric',
          date: m.recordedAt || new Date(),
          title: `${m.metricType} Reading`,
          category: m.metricType,
          description: `${m.value} ${m.unit}`,
          icon: 'Activity',
          color: 'indigo',
          data: m
        })));
      } catch (error) {
        console.error('Error fetching health metrics for timeline:', error);
      }
    }

    // Sort by date (most recent first)
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply limit
    const paginatedTimeline = timeline.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginatedTimeline.length,
      total: timeline.length,
      timeline: paginatedTimeline
    });
  } catch (error) {
    console.error('Get medical timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get timeline stats
// @route   GET /api/timeline/stats
// @access  Private
exports.getTimelineStats = async (req, res) => {
  try {
    const userId = req.user.role === 'patient' ? req.user._id : req.query.userId;

    const stats = {
      totalReports: await Report.countDocuments({ patient: userId }),
      totalPrescriptions: await Prescription.countDocuments({ patient: userId }),
      totalAppointments: await Appointment.countDocuments({ patient: userId }),
      totalVaccinations: await Vaccination.countDocuments({ user: userId }),
      activeAllergies: await Allergy.countDocuments({ user: userId, isActive: true }),
      recentActivity: 0
    };

    // Count recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    stats.recentActivity = 
      await Report.countDocuments({ patient: userId, uploadDate: { $gte: thirtyDaysAgo } }) +
      await Prescription.countDocuments({ patient: userId, createdAt: { $gte: thirtyDaysAgo } }) +
      await Appointment.countDocuments({ patient: userId, appointmentDate: { $gte: thirtyDaysAgo } });

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get timeline stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search timeline
// @route   GET /api/timeline/search
// @access  Private
exports.searchTimeline = async (req, res) => {
  try {
    const userId = req.user.role === 'patient' ? req.user._id : req.query.userId;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const results = [];

    // Search reports
    const reports = await Report.find({
      patient: userId,
      $or: [
        { title: searchRegex },
        { reportType: searchRegex },
        { description: searchRegex }
      ]
    }).select('title reportType uploadDate').limit(10).lean();

    results.push(...reports.map(r => ({ type: 'report', ...r })));

    // Search prescriptions
    const prescriptions = await Prescription.find({
      patient: userId,
      $or: [
        { diagnosis: searchRegex },
        { 'medications.name': searchRegex }
      ]
    }).select('diagnosis medications createdAt').limit(10).lean();

    results.push(...prescriptions.map(p => ({ type: 'prescription', ...p })));

    // Search vaccinations
    const vaccinations = await Vaccination.find({
      user: userId,
      $or: [
        { vaccineName: searchRegex },
        { diseaseTarget: searchRegex }
      ]
    }).select('vaccineName diseaseTarget dateAdministered').limit(10).lean();

    results.push(...vaccinations.map(v => ({ type: 'vaccination', ...v })));

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Search timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
