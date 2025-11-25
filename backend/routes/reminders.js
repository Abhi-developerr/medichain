const express = require('express');
const router = express.Router();
const {
  createReminder,
  getMyReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
  sendReminderEmails
} = require('../controllers/reminderController');
const { protect, authorize } = require('../middleware/auth');

// All routes require patient role (except send emails)
router.post('/', protect, authorize('patient'), createReminder);
router.get('/', protect, authorize('patient'), getMyReminders);
router.get('/:id', protect, authorize('patient'), getReminder);
router.put('/:id', protect, authorize('patient'), updateReminder);
router.delete('/:id', protect, authorize('patient'), deleteReminder);
router.put('/:id/toggle', protect, authorize('patient'), toggleReminder);

// Internal route for cron job
router.post('/send', sendReminderEmails);

module.exports = router;