const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  scanDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  verifyDocument,
  getStats
} = require('../controllers/documentScannerController');

// All routes require authentication
router.use(protect);

// Scan a new document
router.post('/scan', scanDocument);

// Get all documents for user
router.get('/', getDocuments);

// Get statistics
router.get('/stats', getStats);

// Get single document
router.get('/:id', getDocument);

// Update document
router.put('/:id', updateDocument);

// Delete document
router.delete('/:id', deleteDocument);

// Verify document (doctors/admins only)
router.post('/:id/verify', verifyDocument);

module.exports = router;
