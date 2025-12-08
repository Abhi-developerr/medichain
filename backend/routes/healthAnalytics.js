const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const {
  generateAnalytics,
  getAnalytics,
  getAnalyticsPeriod,
  getVitalsTrends
} = require('../controllers/healthAnalyticsController');

router.use(protect);

router.route('/')
  .get(cacheMiddleware(3600), getAnalytics) // Cache 1 hour
  .post(generateAnalytics);

router.get('/trends/:vital', cacheMiddleware(3600), getVitalsTrends);
router.get('/:id', cacheMiddleware(3600), getAnalyticsPeriod);

module.exports = router;
