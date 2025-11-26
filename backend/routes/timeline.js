const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMedicalTimeline,
  getTimelineStats,
  searchTimeline
} = require('../controllers/timelineController');

// Protect all routes
router.use(protect);

router.get('/', getMedicalTimeline);
router.get('/stats', getTimelineStats);
router.get('/search', searchTimeline);

module.exports = router;
