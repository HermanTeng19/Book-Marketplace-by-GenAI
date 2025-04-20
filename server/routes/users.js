const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { 
  updateProfileValidation,
  updateWalletValidation,
  updateRoleValidation,
  validate 
} = require('../utils/validators');

// Public routes
// None - all user routes require authentication

// Protected routes (require authentication)
router.use(auth);

// Get current user profile
router.get('/profile', userController.getProfile);

// Get current user basic info
router.get('/me', userController.getMe);

// Update user profile
router.put('/profile', updateProfileValidation, validate, userController.updateProfile);

// Update user wallet
router.put('/wallet', updateWalletValidation, validate, userController.updateWallet);

// Get user's purchased books
router.get('/purchased-books', userController.getPurchasedBooks);

// Get user's selling books
router.get('/selling-books', userController.getSellingBooks);

// Get user's transactions
router.get('/transactions', userController.getTransactions);

// Admin routes (require both authentication and admin role)
router.use(admin);

// Get user statistics (must come before /:id route)
router.get('/stats', userController.getUserStats);

// Get all users
router.get('/', userController.getUsers);

// Get single user
router.get('/:id', userController.getUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Update user role
router.put('/:id/role', updateRoleValidation, validate, userController.updateUserRole);

module.exports = router; 