const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAppointments,
  createAppointment,
  getAppointment,
  updateAppointment,
  startSession,
  completeSession,
  addRating,
  getStats
} = require('../controllers/telemedicineController');

router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.get('/stats', getStats);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointment);

router.put('/:id/start', startSession);
router.put('/:id/complete', completeSession);
router.post('/:id/rating', addRating);

module.exports = router;
