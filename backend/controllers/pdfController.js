const PDFDocument = require('pdfkit');
const Report = require('../models/Report');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const HealthMetric = require('../models/HealthMetric');

// @desc    Export medical records to PDF
// @route   GET /api/reports/export-pdf
// @access  Private
exports.exportMedicalRecordsPDF = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, includeReports = true, includePrescriptions = true, includeMetrics = true } = req.query;

    // Get user info
    const user = await User.findById(userId);

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Fetch data
    let reports = [];
    let prescriptions = [];
    let metrics = [];

    if (includeReports === 'true') {
      reports = await Report.find({
        patient: userId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {})
      })
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    }

    if (includePrescriptions === 'true') {
      prescriptions = await Prescription.find({
        patient: userId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {})
      })
        .populate('doctor', 'name specialization')
        .sort({ createdAt: -1 })
        .lean();
    }

    if (includeMetrics === 'true') {
      metrics = await HealthMetric.find({
        user: userId,
        ...(startDate || endDate ? { date: dateFilter } : {})
      })
        .sort({ date: -1 })
        .lean();
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=medical-records-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add header
    doc.fontSize(24).fillColor('#2563eb').text('Medical Records', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666').text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Patient Information
    doc.fontSize(16).fillColor('#000').text('Patient Information');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#333');
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    if (user.phone) doc.text(`Phone: ${user.phone}`);
    if (user.dateOfBirth) doc.text(`Date of Birth: ${new Date(user.dateOfBirth).toLocaleDateString()}`);
    if (user.gender) doc.text(`Gender: ${user.gender}`);
    doc.moveDown(2);

    // Medical Reports
    if (reports.length > 0) {
      doc.fontSize(16).fillColor('#000').text('Medical Reports');
      doc.moveDown(0.5);

      reports.forEach((report, index) => {
        doc.fontSize(12).fillColor('#2563eb').text(`${index + 1}. ${report.title}`);
        doc.fontSize(10).fillColor('#666');
        doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`);
        doc.text(`Type: ${report.reportType}`);
        if (report.description) doc.text(`Description: ${report.description}`);
        if (report.uploadedBy) doc.text(`Uploaded by: ${report.uploadedBy.name}`);
        doc.moveDown(1);

        // Add page break if needed
        if (doc.y > 700) doc.addPage();
      });
      doc.moveDown(1);
    }

    // Prescriptions
    if (prescriptions.length > 0) {
      if (doc.y > 600) doc.addPage();
      
      doc.fontSize(16).fillColor('#000').text('Prescriptions');
      doc.moveDown(0.5);

      prescriptions.forEach((prescription, index) => {
        doc.fontSize(12).fillColor('#2563eb').text(`${index + 1}. Prescription from ${prescription.doctor?.name || 'Unknown'}`);
        doc.fontSize(10).fillColor('#666');
        doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
        if (prescription.diagnosis) doc.text(`Diagnosis: ${prescription.diagnosis}`);
        
        if (prescription.medications && prescription.medications.length > 0) {
          doc.text('Medications:');
          prescription.medications.forEach(med => {
            doc.text(`  • ${med.name} - ${med.dosage} (${med.frequency}) for ${med.duration}`);
          });
        }
        
        if (prescription.instructions) doc.text(`Instructions: ${prescription.instructions}`);
        doc.moveDown(1);

        if (doc.y > 700) doc.addPage();
      });
      doc.moveDown(1);
    }

    // Health Metrics
    if (metrics.length > 0) {
      if (doc.y > 600) doc.addPage();
      
      doc.fontSize(16).fillColor('#000').text('Health Metrics');
      doc.moveDown(0.5);

      metrics.slice(0, 20).forEach((metric, index) => {
        doc.fontSize(10).fillColor('#333');
        const date = new Date(metric.date).toLocaleDateString();
        const metricText = `${date}: `;
        const details = [];
        
        if (metric.weight) details.push(`Weight: ${metric.weight}kg`);
        if (metric.height) details.push(`Height: ${metric.height}cm`);
        if (metric.bloodPressure) details.push(`BP: ${metric.bloodPressure}`);
        if (metric.heartRate) details.push(`HR: ${metric.heartRate}bpm`);
        if (metric.bloodSugar) details.push(`Blood Sugar: ${metric.bloodSugar}mg/dL`);
        
        doc.text(metricText + details.join(', '));
        
        if ((index + 1) % 15 === 0 && doc.y > 700) doc.addPage();
      });
      doc.moveDown(1);
    }

    // Footer
    if (doc.y > 700) doc.addPage();
    doc.fontSize(8).fillColor('#999').text('This document is computer generated and contains confidential medical information.', { align: 'center' });
    doc.text(`MediChain - Medical Records Management System`, { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF'
    });
  }
};

// @desc    Export single report to PDF
// @route   GET /api/reports/:id/pdf
// @access  Private
exports.exportSingleReportPDF = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patient', 'name email phone dateOfBirth gender')
      .populate('uploadedBy', 'name email')
      .lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check access
    if (report.patient._id.toString() !== req.user._id.toString() && 
        report.uploadedBy?._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this report'
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report._id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#2563eb').text('Medical Report', { align: 'center' });
    doc.moveDown(2);

    // Report Info
    doc.fontSize(18).fillColor('#000').text(report.title);
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666');
    doc.text(`Report Type: ${report.reportType}`);
    doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`);
    doc.moveDown(1);

    // Patient Info
    doc.fontSize(14).fillColor('#000').text('Patient Information');
    doc.fontSize(10).fillColor('#333');
    doc.text(`Name: ${report.patient.name}`);
    doc.text(`Email: ${report.patient.email}`);
    if (report.patient.phone) doc.text(`Phone: ${report.patient.phone}`);
    if (report.patient.dateOfBirth) doc.text(`Date of Birth: ${new Date(report.patient.dateOfBirth).toLocaleDateString()}`);
    doc.moveDown(1);

    // Description
    if (report.description) {
      doc.fontSize(14).fillColor('#000').text('Description');
      doc.fontSize(10).fillColor('#333').text(report.description);
      doc.moveDown(1);
    }

    // Uploaded by
    if (report.uploadedBy) {
      doc.fontSize(10).fillColor('#666');
      doc.text(`Uploaded by: ${report.uploadedBy.name} (${report.uploadedBy.email})`);
    }

    // Footer
    doc.moveDown(3);
    doc.fontSize(8).fillColor('#999').text('This document is confidential medical information.', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Export single report PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF'
    });
  }
};
