const express = require('express');
const router = express.Router();
const {
  getReportComments,
  addReportComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/:reportId/comments', protect, getReportComments);
router.post('/:reportId/comments', protect, addReportComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
