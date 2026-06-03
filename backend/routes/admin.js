const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auditController = require('../controllers/auditController');
const { requireAdmin } = require('../middleware/auth');

// All admin routes require admin token
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.toggleBan);
router.put('/users/:id/role', adminController.toggleAdmin);
router.put('/users/:id/password', adminController.changePassword);
router.delete('/users/:id', adminController.deleteUser);

// Order management
router.get('/orders', adminController.getOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.delete('/orders/:id', adminController.deleteOrder);

// Audit logs
router.get('/audit-logs', auditController.getAuditLogs);
router.get('/audit-logs/actions', auditController.getActionTypes);
router.delete('/audit-logs', auditController.clearAuditLogs);

module.exports = router;
