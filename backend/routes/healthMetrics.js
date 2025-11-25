const express = require('express');
const router = express.Router();
const {
  getHealthMetrics,
  addHealthMetric,
  getHealthMetricsStats,
  deleteHealthMetric
} = require('../controllers/healthMetricController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getHealthMetrics);
router.get('/stats', protect, getHealthMetricsStats);
router.post('/', protect, addHealthMetric);
router.delete('/:id', protect, deleteHealthMetric);

module.exports = router;
