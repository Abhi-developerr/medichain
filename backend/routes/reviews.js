const express = require('express');
const router = express.Router();
const {
  createReview,
  getDoctorReviews,
  addDoctorResponse,
  markHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/doctor/:doctorId', getDoctorReviews);
router.put('/:id/response', protect, addDoctorResponse);
router.put('/:id/helpful', protect, markHelpful);

module.exports = router;
