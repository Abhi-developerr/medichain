const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const {
  getRecords,
  getRecordByType,
  updateRecord,
  addToArray,
  removeFromArray,
  getSummary
} = require('../controllers/healthRecordController');

router.use(protect);

router.get('/', cacheMiddleware(1800), getRecords); // Cache 30 minutes
router.get('/summary', cacheMiddleware(1800), getSummary);
router.get('/:userId/:recordType', cacheMiddleware(1800), getRecordByType);
router.put('/:userId/:recordType', updateRecord);
router.post('/:userId/:recordType/add', addToArray);
router.delete('/:userId/:recordType/remove', removeFromArray);

module.exports = router;
