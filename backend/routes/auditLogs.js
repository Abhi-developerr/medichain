const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMyActivity } = require('../controllers/auditLogController');

router.get('/my-activity', protect, getMyActivity);

module.exports = router;
