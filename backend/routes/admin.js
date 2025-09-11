const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const {
  getUsers,
  updateUserRole,
  toggleUserBan,
  createAdmin,
  getReports,
  deleteReport,
  restoreReport,
  getAuditLogs,
  getDashboardStats
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/ban', toggleUserBan);
router.post('/users', createAdmin);

// Report management
router.get('/reports', getReports);
router.delete('/reports/:id', deleteReport);
router.patch('/reports/:id/restore', restoreReport);

// Audit logs
router.get('/audit', getAuditLogs);

module.exports = router;
