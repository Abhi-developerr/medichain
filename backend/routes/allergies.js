const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addAllergy,
  getAllergies,
  getCriticalAllergies,
  checkMedicationAllergy,
  updateAllergy,
  deleteAllergy,
  recordReaction
} = require('../controllers/allergyController');

router.route('/')
  .post(protect, addAllergy)
  .get(protect, getAllergies);

router.get('/critical', protect, getCriticalAllergies);
router.post('/check-medication', protect, checkMedicationAllergy);

router.route('/:id')
  .put(protect, updateAllergy)
  .delete(protect, deleteAllergy);

router.post('/:id/reaction', protect, recordReaction);

module.exports = router;
