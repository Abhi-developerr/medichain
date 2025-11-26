const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescription,
  updatePrescriptionStatus,
  deletePrescription,
  checkMedicationInteractions
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPrescriptions)
  .post(createPrescription);

router.post('/check-interactions', checkMedicationInteractions);

router.route('/:id')
  .get(getPrescription)
  .delete(deletePrescription);

router.put('/:id/status', updatePrescriptionStatus);

module.exports = router;
