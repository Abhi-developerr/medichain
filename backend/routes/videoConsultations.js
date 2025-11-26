const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConsultations,
  scheduleConsultation,
  getConsultation,
  startConsultation,
  endConsultation,
  cancelConsultation,
  rateConsultation,
  getConsultationStats
} = require('../controllers/videoConsultationController');

router.use(protect);

router.get('/', getConsultations);
router.post('/', scheduleConsultation);
router.get('/stats', getConsultationStats);
router.get('/:id', getConsultation);
router.put('/:id/start', startConsultation);
router.put('/:id/end', endConsultation);
router.put('/:id/cancel', cancelConsultation);
router.put('/:id/rate', rateConsultation);

module.exports = router;
