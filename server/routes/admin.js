const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { validate } = require('../utils/validators');

// All routes are protected and require admin privileges
router.use(auth);
router.use(admin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);

// Book management
router.get('/books', adminController.getBooks);
router.put('/books/:id/status', adminController.updateBookStatus);
router.delete('/books/:id', adminController.deleteBook);

// Transaction management
router.get('/transactions', adminController.getTransactions);
router.put('/transactions/:id/status', adminController.updateTransactionStatus);

module.exports = router; 