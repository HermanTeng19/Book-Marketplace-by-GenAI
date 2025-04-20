const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { check } = require('express-validator');

// Create payment intent - Private
router.post(
  '/create-payment-intent',
  [
    auth,
    check('bookId', 'Book ID is required').notEmpty().isMongoId()
  ],
  transactionController.createPaymentIntent
);

// Confirm payment and complete transaction - Private
router.post(
  '/confirm-payment',
  [
    auth,
    check('paymentIntentId', 'Payment intent ID is required').notEmpty()
  ],
  transactionController.confirmPayment
);

// Notify about failed payment - Private
router.post(
  '/payment-failed',
  [
    auth,
    check('paymentIntentId', 'Payment intent ID is required').notEmpty()
  ],
  transactionController.notifyPaymentFailed
);

// Get user transactions - Private
router.get('/', auth, transactionController.getUserTransactions);

// Get transaction by ID - Private
router.get('/:id', auth, transactionController.getTransactionById);

// Refund transaction - Admin only
router.post('/:id/refund', [auth, admin], transactionController.refundTransaction);

module.exports = router; 