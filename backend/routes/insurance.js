const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getInsurancePolicies,
  createInsurance,
  getInsurance,
  updateInsurance,
  deleteInsurance,
  addClaim,
  updateClaimStatus,
  getInsuranceStats
} = require('../controllers/insuranceController');

router.use(protect);

router.route('/')
  .get(getInsurancePolicies)
  .post(createInsurance);

router.route('/stats')
  .get(getInsuranceStats);

router.route('/:id')
  .get(getInsurance)
  .put(updateInsurance)
  .delete(deleteInsurance);

router.route('/:id/claims')
  .post(addClaim);

router.route('/:id/claims/status')
  .put(updateClaimStatus);

module.exports = router;
