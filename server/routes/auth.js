const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { 
  registerValidation, 
  loginValidation, 
  resetPasswordValidation,
  newPasswordValidation,
  changePasswordValidation,
  validate 
} = require('../utils/validators');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/forgot-password', resetPasswordValidation, validate, authController.forgotPassword);
router.put('/reset-password/:token', newPasswordValidation, validate, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes
router.get('/me', auth, authController.getMe);
router.post('/logout', auth, authController.logout);
router.put('/change-password', auth, changePasswordValidation, validate, authController.changePassword);

module.exports = router; 