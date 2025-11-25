const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/conversation/:userId', getConversation);
router.delete('/:id', deleteMessage);

module.exports = router;
