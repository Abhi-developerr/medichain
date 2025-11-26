const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateMedicalID,
  addContact,
  updateContact,
  deleteContact,
  triggerSOS,
  updateSOSStatus,
  updateQuickAccess,
  updateSettings,
  getSOSHistory,
  getPublicMedicalID
} = require('../controllers/emergencySOSController');

// Public route for emergency responders
router.get('/public/:userId', getPublicMedicalID);

// All other routes require authentication
router.use(protect);

// Get or create profile
router.get('/profile', getProfile);

// Update medical ID
router.put('/medical-id', updateMedicalID);

// Emergency contacts
router.post('/contacts', addContact);
router.put('/contacts/:contactId', updateContact);
router.delete('/contacts/:contactId', deleteContact);

// SOS alerts
router.post('/trigger', triggerSOS);
router.get('/history', getSOSHistory);
router.put('/alert/:alertId', updateSOSStatus);

// Quick access info
router.put('/quick-access', updateQuickAccess);

// Settings
router.put('/settings', updateSettings);

module.exports = router;
