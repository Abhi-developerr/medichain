const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRecords,
  getRecordByType,
  updateRecord,
  addToArray,
  removeFromArray,
  getSummary
} = require('../controllers/healthRecordController');

router.use(protect);

router.get('/', getRecords);
router.get('/summary', getSummary);
router.get('/:userId/:recordType', getRecordByType);
router.put('/:userId/:recordType', updateRecord);
router.post('/:userId/:recordType/add', addToArray);
router.delete('/:userId/:recordType/remove', removeFromArray);

module.exports = router;
