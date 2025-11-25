const ReportComment = require('../models/ReportComment');
const Report = require('../models/Report');
const { createNotification } = require('./notificationController');

// @desc    Get comments for a report
// @route   GET /api/reports/:reportId/comments
// @access  Private
exports.getReportComments = async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    const isAuthorized = 
      report.patient.toString() === req.user._id.toString() ||
      (req.user.role === 'doctor' && report.sharedWith.some(s => 
        s.doctor.toString() === req.user._id.toString() && !s.accessRevoked
      ));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view comments'
      });
    }

    const comments = await ReportComment.find({ report: req.params.reportId })
      .populate('user', 'name email role')
      .populate('mentions', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments'
    });
  }
};

// @desc    Add comment to report
// @route   POST /api/reports/:reportId/comments
// @access  Private
exports.addReportComment = async (req, res) => {
  try {
    const { comment, isPrivate, mentions } = req.body;

    const report = await Report.findById(req.params.reportId).populate('patient', 'name');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    const isAuthorized = 
      report.patient._id.toString() === req.user._id.toString() ||
      (req.user.role === 'doctor' && report.sharedWith.some(s => 
        s.doctor.toString() === req.user._id.toString() && !s.accessRevoked
      ));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment'
      });
    }

    const newComment = await ReportComment.create({
      report: req.params.reportId,
      user: req.user._id,
      comment,
      isPrivate,
      mentions
    });

    await newComment.populate('user', 'name email role');

    // Notify report owner if comment is from doctor
    if (req.user.role === 'doctor' && report.patient._id.toString() !== req.user._id.toString()) {
      await createNotification(
        report.patient._id,
        'report_comment',
        'New Comment on Report',
        `Dr. ${req.user.name} commented on your report: ${report.title}`,
        report._id,
        req.user._id,
        `/patient/reports`
      );
    }

    // Notify mentioned users
    if (mentions && mentions.length > 0) {
      for (const mentionedUserId of mentions) {
        if (mentionedUserId.toString() !== req.user._id.toString()) {
          await createNotification(
            mentionedUserId,
            'report_mention',
            'You were mentioned',
            `${req.user.name} mentioned you in a comment`,
            report._id,
            req.user._id,
            `/patient/reports`
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding comment'
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const comment = await ReportComment.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or not authorized'
      });
    }

    comment.comment = req.body.comment;
    comment.isEdited = true;
    comment.editedAt = Date.now();
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comment'
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await ReportComment.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or not authorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment'
    });
  }
};
