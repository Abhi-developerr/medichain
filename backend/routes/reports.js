const express = require('express');
const router = express.Router();
const {
  uploadReport,
  getMyReports,
  getReport,
  updateReport,
  deleteReport,
  downloadReport,
  viewReport,
  grantAccess,
  revokeAccess,
  getSharedReports,
  getReportStats,
  accessWithShareCode,
  addDoctorNotes,
  updateReportStatus,
  searchReports,
  toggleArchive,
  updatePriority
} = require('../controllers/reportController');
const { exportMedicalRecordsPDF, exportSingleReportPDF } = require('../controllers/pdfController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Patient routes
router.post('/upload', protect, authorize('patient'), upload.single('file'), uploadReport);
router.get('/my-reports', protect, authorize('patient'), getMyReports);
router.get('/stats', protect, getReportStats);

// PDF export routes
router.get('/export-pdf', protect, exportMedicalRecordsPDF);
router.get('/:id/pdf', protect, exportSingleReportPDF);

// Search and filter (all authenticated users)
router.get('/search', protect, searchReports);

// Doctor routes - must come before /:id route
router.post('/access', protect, authorize('doctor'), accessWithShareCode);
router.get('/shared/all', protect, authorize('doctor'), getSharedReports);

// Common routes (Patient & Doctor)
router.get('/download/:id', protect, downloadReport);
router.get('/view/:fileId', protect, viewReport);
router.get('/:id', protect, getReport);

// Patient-only operations
router.put('/:id', protect, authorize('patient'), updateReport);
router.delete('/:id', protect, authorize('patient'), deleteReport);
router.post('/:id/grant-access', protect, authorize('patient'), grantAccess);
router.post('/:id/revoke-access', protect, authorize('patient'), revokeAccess);
router.put('/:id/archive', protect, authorize('patient'), toggleArchive);

// Priority update (Patient & Doctor)
router.put('/:id/priority', protect, updatePriority);

// Doctor routes
router.put('/:id/notes', protect, authorize('doctor'), addDoctorNotes);
router.put('/:id/status', protect, authorize('doctor'), updateReportStatus);

module.exports = router;
