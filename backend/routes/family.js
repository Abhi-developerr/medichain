const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addFamilyMember,
  getFamilyMembers,
  getFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  addMedicalCondition,
  getFamilyHealthSummary
} = require('../controllers/familyController');

// Protect all routes
router.use(protect);

router.route('/')
  .post(addFamilyMember)
  .get(getFamilyMembers);

router.get('/summary', getFamilyHealthSummary);

router.route('/:id')
  .get(getFamilyMember)
  .put(updateFamilyMember)
  .delete(deleteFamilyMember);

router.post('/:id/conditions', addMedicalCondition);

module.exports = router;
