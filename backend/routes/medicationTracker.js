const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMedications,
  addMedication,
  getMedication,
  updateMedication,
  deleteMedication,
  logAdherence,
  updateStatus,
  getMedicationStats,
  getDueMedications
} = require('../controllers/medicationTrackerController');

router.use(protect);

router.get('/', getMedications);
router.post('/', addMedication);
router.get('/stats', getMedicationStats);
router.get('/due', getDueMedications);
router.get('/:id', getMedication);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);
router.post('/:id/log', logAdherence);
router.put('/:id/status', updateStatus);

module.exports = router;
