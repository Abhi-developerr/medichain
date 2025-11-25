const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getPendingDoctors,
  verifyDoctor,
  rejectDoctor,
  deleteUser,
  updateUserRole,
  getDashboardStats,
  getSystemLogs
} = require('../controllers/adminController');
const { getAuditLogs, getAuditStats } = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/auth');

// All routes are admin-only
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/pending-doctors', getPendingDoctors);
router.get('/stats', getDashboardStats);
router.get('/logs', getSystemLogs);
router.get('/audit-logs', getAuditLogs);
router.get('/audit-logs/stats', getAuditStats);

router.put('/verify-doctor/:id', verifyDoctor);
router.put('/reject-doctor/:id', rejectDoctor);
router.put('/user-role/:id', updateUserRole);
router.delete('/user/:id', deleteUser);

module.exports = router;
