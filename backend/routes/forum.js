const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPosts,
  createPost,
  getPost,
  addReply,
  likePost,
  likeReply,
  reportPost,
  deletePost,
  getStats
} = require('../controllers/forumController');

// All routes require authentication
router.use(protect);

// Get all posts
router.get('/', getPosts);

// Create new post
router.post('/', createPost);

// Get statistics
router.get('/stats', getStats);

// Get single post
router.get('/:id', getPost);

// Delete post
router.delete('/:id', deletePost);

// Add reply to post
router.post('/:id/reply', addReply);

// Like/unlike post
router.post('/:id/like', likePost);

// Like/unlike reply
router.post('/:postId/reply/:replyId/like', likeReply);

// Report post
router.post('/:id/report', reportPost);

module.exports = router;
