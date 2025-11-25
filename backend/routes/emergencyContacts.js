const express = require('express');
const router = express.Router();
const {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact
} = require('../controllers/emergencyContactController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getEmergencyContacts);
router.post('/', protect, addEmergencyContact);
router.put('/:id', protect, updateEmergencyContact);
router.delete('/:id', protect, deleteEmergencyContact);

module.exports = router;
