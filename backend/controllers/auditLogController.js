const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resource, userId, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.user = userId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      logs
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get audit log statistics
// @route   GET /api/admin/audit-logs/stats
// @access  Private/Admin
exports.getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get action counts
    const actionStats = await AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get resource counts
    const resourceStats = await AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get top users
    const topUsers = await AuditLog.aggregate([
      { $match: filter },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$userInfo.name',
          email: '$userInfo.email',
          role: '$userInfo.role'
        }
      }
    ]);

    // Get activity by date
    const activityByDate = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        actions: actionStats,
        resources: resourceStats,
        topUsers,
        activityByDate
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's own audit logs
// @route   GET /api/audit-logs/my-activity
// @access  Private
exports.getMyActivity = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      logs
    });
  } catch (error) {
    console.error('Get my activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
