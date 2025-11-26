const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addVaccination,
  getVaccinations,
  getUpcomingVaccinations,
  updateVaccination,
  deleteVaccination,
  getVaccinationStats
} = require('../controllers/vaccinationController');

router.route('/')
  .post(protect, addVaccination)
  .get(protect, getVaccinations);

router.get('/upcoming', protect, getUpcomingVaccinations);
router.get('/stats', protect, getVaccinationStats);

router.route('/:id')
  .put(protect, updateVaccination)
  .delete(protect, deleteVaccination);

module.exports = router;
