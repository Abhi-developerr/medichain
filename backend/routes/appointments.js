const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointmentStats
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAppointments);
router.get('/stats', protect, getAppointmentStats);
router.post('/', protect, authorize('patient'), createAppointment);
router.put('/:id/status', protect, updateAppointmentStatus);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
