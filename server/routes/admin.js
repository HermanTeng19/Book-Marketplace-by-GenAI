const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userRoleController = require('../controllers/userRoleController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { validate, roleUpdateRules } = require('../utils/validators');

// All routes are protected and require admin privileges
router.use(auth);
router.use(admin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);

// User role management
router.put('/users/:id/role', roleUpdateRules, validate, userRoleController.updateUserRole);
router.get('/users/:id/role-logs', userRoleController.getUserRoleAuditLogs);

// Book management
router.get('/books', adminController.getBooks);
router.put('/books/:id/status', adminController.updateBookStatus);
router.delete('/books/:id', adminController.deleteBook);

// Transaction management
router.get('/transactions', adminController.getTransactions);
router.put('/transactions/:id/status', adminController.updateTransactionStatus);

module.exports = router; 