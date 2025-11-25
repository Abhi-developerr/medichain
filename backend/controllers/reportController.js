const Report = require('../models/Report');
const User = require('../models/User');
const { getGridFSBucket } = require('../config/db');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');

// @desc    Upload a new report
// @route   POST /api/reports/upload
// @access  Private (Patient)
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { title, description, reportType, tags } = req.body;

    // Generate unique filename
    const filename = crypto.randomBytes(16).toString('hex') + path.extname(req.file.originalname);
    
    // Get GridFS bucket
    const bucket = getGridFSBucket();
    
    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'File storage not available'
      });
    }

    // Create upload stream
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: {
        originalname: req.file.originalname,
        uploadedBy: req.user._id,
        uploadDate: new Date()
      }
    });

    // Write file buffer to GridFS
    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      try {
        const report = await Report.create({
          patient: req.user._id,
          title,
          description,
          reportType,
          fileId: uploadStream.id,
          filename: filename,
          contentType: req.file.mimetype,
          fileSize: req.file.size,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        res.status(201).json({
          success: true,
          message: 'Report uploaded successfully',
          report
        });
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Error saving report'
        });
      }
    });

    uploadStream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading file'
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading report'
    });
  }
};

// @desc    Get all reports for logged in patient
// @route   GET /api/reports/my-reports
// @access  Private (Patient)
exports.getMyReports = async (req, res) => {
  try {
    const { status, reportType, sortBy } = req.query;
    
    const query = { patient: req.user._id, isArchived: false };
    
    if (status) query.status = status;
    if (reportType) query.reportType = reportType;

    const sortOptions = {
      'newest': { uploadDate: -1 },
      'oldest': { uploadDate: 1 },
      'title': { title: 1 }
    };

    const reports = await Report.find(query)
      .sort(sortOptions[sortBy] || { uploadDate: -1 })
      .populate('viewedBy.doctor', 'name specialization');

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
};

// @desc    Get single report details
// @route   GET /api/reports/:id
// @access  Private
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('viewedBy.doctor', 'name email specialization');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && report.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this report'
      });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report'
    });
  }
};

// @desc    Download/stream report file
// @route   GET /api/reports/:id/download
// @access  Private
exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('patient');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && report.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const gridfsBucket = getGridFSBucket();
    
    res.set('Content-Type', report.contentType);
    res.set('Content-Disposition', `attachment; filename="${report.filename}"`);

    const downloadStream = gridfsBucket.openDownloadStream(report.fileId);
    
    downloadStream.on('error', (error) => {
      console.error('Download error:', error);
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Patient)
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    if (report.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    // Delete file from GridFS
    const gridfsBucket = getGridFSBucket();
    await gridfsBucket.delete(report.fileId);

    // Delete report document
    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report'
    });
  }
};

// @desc    Access patient reports using share code (Doctor)
// @route   POST /api/reports/access
// @access  Private (Doctor)
exports.accessWithShareCode = async (req, res) => {
  try {
    const { shareCode } = req.body;

    if (!shareCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a share code'
      });
    }

    // Find patient by share code
    const patient = await User.findOne({ shareCode: shareCode.toUpperCase(), role: 'patient' });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Invalid share code'
      });
    }

    // Get patient's reports
    const reports = await Report.find({ patient: patient._id, isArchived: false })
      .sort({ uploadDate: -1 })
      .populate('patient', 'name email phone dateOfBirth gender');

    res.status(200).json({
      success: true,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender
      },
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accessing reports'
    });
  }
};

// @desc    Add doctor notes/remarks to report
// @route   PUT /api/reports/:id/notes
// @access  Private (Doctor)
exports.addDoctorNotes = async (req, res) => {
  try {
    const { notes, status } = req.body;
    
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Add doctor view record
    const viewRecord = {
      doctor: req.user._id,
      viewedAt: Date.now(),
      notes: notes || ''
    };

    // Check if doctor already viewed this report
    const existingViewIndex = report.viewedBy.findIndex(
      view => view.doctor.toString() === req.user._id.toString()
    );

    if (existingViewIndex !== -1) {
      report.viewedBy[existingViewIndex] = viewRecord;
    } else {
      report.viewedBy.push(viewRecord);
    }

    if (status) {
      report.status = status;
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Notes added successfully',
      report
    });
  } catch (error) {
    console.error('Notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding notes'
    });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private (Doctor/Patient)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status'
    });
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private (Patient)
exports.updateReport = async (req, res) => {
  try {
    const { title, description, reportType, tags } = req.body;
    
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    report.title = title || report.title;
    report.description = description || report.description;
    report.reportType = reportType || report.reportType;
    report.tags = tags ? tags.split(',').map(tag => tag.trim()) : report.tags;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating report'
    });
  }
};

// @desc    View report file
// @route   GET /api/reports/view/:fileId
// @access  Private
exports.viewReport = async (req, res) => {
  try {
    const gridfsBucket = getGridFSBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    
    const files = await gridfsBucket.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType);
    
    const downloadStream = gridfsBucket.openDownloadStream(fileId);
    
    downloadStream.on('error', (error) => {
      console.error('View error:', error);
      res.status(404).json({
        success: false,
        message: 'Error streaming file'
      });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('View error:', error);
    res.status(500).json({
      success: false,
      message: 'Error viewing file'
    });
  }
};

// @desc    Grant access to doctor
// @route   POST /api/reports/:id/grant-access
// @access  Private (Patient)
exports.grantAccess = async (req, res) => {
  try {
    const { doctorId } = req.body;
    
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Access granted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error granting access'
    });
  }
};

// @desc    Revoke access from doctor
// @route   POST /api/reports/:id/revoke-access
// @access  Private (Patient)
exports.revokeAccess = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Access revoked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error revoking access'
    });
  }
};

// @desc    Get shared reports (for doctors)
// @route   GET /api/reports/shared/all
// @access  Private (Doctor)
exports.getSharedReports = async (req, res) => {
  try {
    const reports = await Report.find({
      'viewedBy.doctor': req.user._id
    })
      .populate('patient', 'name email phone')
      .sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shared reports'
    });
  }
};

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Private (Patient)
exports.getReportStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let matchQuery = {};
    if (userRole === 'patient') {
      matchQuery = { patient: userId, isArchived: false };
    } else if (userRole === 'doctor') {
      // Get reports shared with this doctor
      const sharedReports = await Report.find({
        'sharedWith.doctor': userId,
        'sharedWith.accessRevoked': false
      }).select('_id patient');
      matchQuery = { _id: { $in: sharedReports.map(r => r._id) } };
    }

    const totalReports = await Report.countDocuments(matchQuery);
    
    const reportsByType = await Report.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$reportType', count: { $sum: 1 } } }
    ]);

    const reportsByStatus = await Report.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const reportsByPriority = await Report.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const recentActivity = await Report.find(matchQuery)
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('patient', 'name')
      .select('title reportType status updatedAt');

    // Monthly upload trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Report.aggregate([
      { 
        $match: { 
          ...matchQuery,
          uploadDate: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$uploadDate' },
            month: { $month: '$uploadDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalReports,
        byType: reportsByType,
        byStatus: reportsByStatus,
        byPriority: reportsByPriority,
        recentActivity,
        monthlyTrends
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

// @desc    Advanced search and filter reports
// @route   GET /api/reports/search
// @access  Private
exports.searchReports = async (req, res) => {
  try {
    const {
      keyword,
      reportType,
      status,
      priority,
      category,
      tags,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'uploadDate',
      sortOrder = 'desc'
    } = req.query;

    let matchQuery = {};

    // User-specific filtering
    if (req.user.role === 'patient') {
      matchQuery.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      matchQuery['sharedWith.doctor'] = req.user._id;
      matchQuery['sharedWith.accessRevoked'] = false;
    }

    // Keyword search
    if (keyword) {
      matchQuery.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Filters
    if (reportType) matchQuery.reportType = reportType;
    if (status) matchQuery.status = status;
    if (priority) matchQuery.priority = priority;
    if (category) matchQuery.category = category;
    if (tags) matchQuery.tags = { $in: tags.split(',') };

    // Date range
    if (dateFrom || dateTo) {
      matchQuery.uploadDate = {};
      if (dateFrom) matchQuery.uploadDate.$gte = new Date(dateFrom);
      if (dateTo) matchQuery.uploadDate.$lte = new Date(dateTo);
    }

    matchQuery.isArchived = false;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reports = await Report.find(matchQuery)
      .populate('patient', 'name email')
      .populate('viewedBy.doctor', 'name specialization')
      .populate('doctorNotes.doctor', 'name specialization')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(matchQuery);

    res.status(200).json({
      success: true,
      reports,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching reports'
    });
  }
};

// @desc    Archive/Unarchive report
// @route   PUT /api/reports/:id/archive
// @access  Private (Patient)
exports.toggleArchive = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      patient: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.isArchived = !report.isArchived;
    await report.save();

    res.status(200).json({
      success: true,
      message: `Report ${report.isArchived ? 'archived' : 'unarchived'} successfully`,
      report
    });
  } catch (error) {
    console.error('Archive error:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving report'
    });
  }
};

// @desc    Update report priority
// @route   PUT /api/reports/:id/priority
// @access  Private
exports.updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority value'
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Authorization check
    const isAuthorized = 
      (req.user.role === 'patient' && report.patient.toString() === req.user._id.toString()) ||
      (req.user.role === 'doctor' && report.sharedWith.some(s => s.doctor.toString() === req.user._id.toString() && !s.accessRevoked));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    report.priority = priority;
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Priority updated successfully',
      report
    });
  } catch (error) {
    console.error('Update priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating priority'
    });
  }
};