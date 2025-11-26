const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getChatSessions,
  createChatSession,
  getChatSession,
  sendMessage,
  archiveChatSession,
  deleteChatSession,
  getChatStats
} = require('../controllers/healthChatController');

router.use(protect);

router.get('/', getChatSessions);
router.post('/', createChatSession);
router.get('/stats', getChatStats);
router.get('/:id', getChatSession);
router.post('/:id/message', sendMessage);
router.put('/:id/archive', archiveChatSession);
router.delete('/:id', deleteChatSession);

module.exports = router;
