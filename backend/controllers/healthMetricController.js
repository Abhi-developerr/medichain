const HealthMetric = require('../models/HealthMetric');

// @desc    Get health metrics for user
// @route   GET /api/health-metrics
// @access  Private
exports.getHealthMetrics = async (req, res) => {
  try {
    const { metricType, startDate, endDate, limit = 100 } = req.query;

    let query = { user: req.user._id };

    if (metricType) query.metricType = metricType;
    
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate);
      if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    const metrics = await HealthMetric.find(query)
      .sort({ recordedAt: -1 })
      .limit(parseInt(limit))
      .populate('relatedReport', 'title reportType');

    res.status(200).json({
      success: true,
      count: metrics.length,
      metrics
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching health metrics'
    });
  }
};

// @desc    Add health metric
// @route   POST /api/health-metrics
// @access  Private
exports.addHealthMetric = async (req, res) => {
  try {
    const {
      metricType,
      value,
      unit,
      systolic,
      diastolic,
      recordedAt,
      notes,
      tags,
      isAbnormal,
      relatedReport
    } = req.body;

    const metric = await HealthMetric.create({
      user: req.user._id,
      metricType,
      value,
      unit,
      systolic,
      diastolic,
      recordedAt: recordedAt || Date.now(),
      notes,
      tags,
      isAbnormal,
      relatedReport
    });

    res.status(201).json({
      success: true,
      message: 'Health metric added successfully',
      metric
    });
  } catch (error) {
    console.error('Add metric error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding health metric'
    });
  }
};

// @desc    Get health metrics statistics
// @route   GET /api/health-metrics/stats
// @access  Private
exports.getHealthMetricsStats = async (req, res) => {
  try {
    const { metricType } = req.query;

    let matchQuery = { user: req.user._id };
    if (metricType) matchQuery.metricType = metricType;

    const total = await HealthMetric.countDocuments(matchQuery);

    const byType = await HealthMetric.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$metricType', count: { $sum: 1 } } }
    ]);

    const abnormalCount = await HealthMetric.countDocuments({
      ...matchQuery,
      isAbnormal: true
    });

    // Get average for numeric metrics
    const averages = await HealthMetric.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$metricType',
          avgValue: { $avg: { $toDouble: '$value' } },
          minValue: { $min: { $toDouble: '$value' } },
          maxValue: { $max: { $toDouble: '$value' } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        byType,
        abnormalCount,
        averages
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

// @desc    Delete health metric
// @route   DELETE /api/health-metrics/:id
// @access  Private
exports.deleteHealthMetric = async (req, res) => {
  try {
    const metric = await HealthMetric.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!metric) {
      return res.status(404).json({
        success: false,
        message: 'Health metric not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Health metric deleted successfully'
    });
  } catch (error) {
    console.error('Delete metric error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting health metric'
    });
  }
};
