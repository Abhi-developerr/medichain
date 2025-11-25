const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  enable2FA,
  verify2FA,
  disable2FA,
  validate2FA
} = require('../controllers/twoFactorController');

router.post('/enable', protect, enable2FA);
router.post('/verify', protect, verify2FA);
router.post('/disable', protect, disable2FA);
router.post('/validate', validate2FA);

module.exports = router;
