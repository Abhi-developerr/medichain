const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateAnalytics,
  getAnalytics,
  getAnalyticsPeriod,
  getVitalsTrends
} = require('../controllers/healthAnalyticsController');

router.use(protect);

router.route('/')
  .get(getAnalytics)
  .post(generateAnalytics);

router.get('/trends/:vital', getVitalsTrends);
router.get('/:id', getAnalyticsPeriod);

module.exports = router;
