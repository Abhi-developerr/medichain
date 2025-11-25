const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescription,
  updatePrescriptionStatus,
  deletePrescription
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPrescriptions)
  .post(createPrescription);

router.route('/:id')
  .get(getPrescription)
  .delete(deletePrescription);

router.put('/:id/status', updatePrescriptionStatus);

module.exports = router;
