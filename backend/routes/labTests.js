const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getLabTests,
  createLabTest,
  getLabTest,
  updateLabTest,
  deleteLabTest,
  getLabTestStats,
  getCriticalTests
} = require('../controllers/labTestController');

router.use(protect);

router.route('/')
  .get(getLabTests)
  .post(createLabTest);

router.route('/stats')
  .get(getLabTestStats);

router.route('/critical')
  .get(getCriticalTests);

router.route('/:id')
  .get(getLabTest)
  .put(updateLabTest)
  .delete(deleteLabTest);

module.exports = router;
