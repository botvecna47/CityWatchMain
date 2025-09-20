const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const {
  getUsers,
  updateUserRole,
  toggleUserBan,
  updateUserCity,
  createAdmin,
  createAuthority,
  getAuthorityTypes,
  createAuthorityType,
  updateAuthorityType,
  deleteAuthorityType,
  getReports,
  deleteReport,
  restoreReport,
  getAuditLogs,
  getDashboardStats,
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// AI insights - temporarily removed
// router.get('/ai-insights', getAIInsights);

// User management
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/ban', toggleUserBan);
router.patch('/users/:id/city', updateUserCity);
router.post('/users', createAdmin);

// Authority creation
router.post('/create-authority', createAuthority);

// Authority types management
router.get('/authority-types', getAuthorityTypes);
router.post('/authority-types', createAuthorityType);
router.put('/authority-types/:id', updateAuthorityType);
router.delete('/authority-types/:id', deleteAuthorityType);

// Report management
router.get('/reports', getReports);
router.delete('/reports/:id', deleteReport);
router.patch('/reports/:id/restore', restoreReport);

// Audit logs
router.get('/audit', getAuditLogs);

module.exports = router;
