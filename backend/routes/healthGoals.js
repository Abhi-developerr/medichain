const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getHealthGoals,
  createHealthGoal,
  updateProgress,
  updateGoalStatus,
  deleteHealthGoal,
  getGoalStats
} = require('../controllers/healthGoalController');

router.use(protect);

router.route('/')
  .get(getHealthGoals)
  .post(createHealthGoal);

router.route('/stats')
  .get(getGoalStats);

router.route('/:id')
  .delete(deleteHealthGoal);

router.route('/:id/progress')
  .put(updateProgress);

router.route('/:id/status')
  .put(updateGoalStatus);

module.exports = router;
