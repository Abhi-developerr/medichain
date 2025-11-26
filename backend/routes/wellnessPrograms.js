const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPrograms,
  createProgram,
  getProgram,
  updateProgram,
  deleteProgram,
  logMeal,
  logWorkout,
  logMeditation,
  logSleep,
  completeTask,
  awardBadge,
  getStats
} = require('../controllers/wellnessProgramController');

// All routes require authentication
router.use(protect);

// Get all programs
router.get('/', getPrograms);

// Create new program
router.post('/', createProgram);

// Get statistics
router.get('/stats', getStats);

// Get single program
router.get('/:id', getProgram);

// Update program
router.put('/:id', updateProgram);

// Delete program
router.delete('/:id', deleteProgram);

// Log meal
router.post('/:id/meal', logMeal);

// Log workout
router.post('/:id/workout', logWorkout);

// Log meditation
router.post('/:id/meditation', logMeditation);

// Log sleep
router.post('/:id/sleep', logSleep);

// Complete daily task
router.post('/:id/task/:taskId/complete', completeTask);

// Award badge
router.post('/:id/badge', awardBadge);

module.exports = router;
