const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createSession,
  getSessions,
  getSession,
  updateStatus,
  completeAction
} = require('../controllers/symptomCheckerController');

router.use(protect);

router.route('/')
  .get(getSessions)
  .post(createSession);

router.route('/:sessionId')
  .get(getSession)
  .put(updateStatus);

router.put('/:sessionId/action', completeAction);

module.exports = router;
