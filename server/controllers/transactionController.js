const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const stripe = require('../config/stripe');
const { validationResult } = require('express-validator');

/**
 * @desc    Create payment intent
 * @route   POST /api/transactions/create-payment-intent
 * @access  Private
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookId } = req.body;
    
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    // Find book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    // Check if book is available
    if (book.status !== 'available') {
      return res.status(400).json({
        success: false,
        error: 'Book is not available for purchase'
      });
    }
    
    // Check if user is trying to buy their own book
    if (book.seller.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot purchase your own book'
      });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(book.price * 100), // Stripe requires amount in cents
      currency: 'usd',
      metadata: {
        bookId: book._id.toString(),
        buyerId: req.user.id,
        sellerId: book.seller.toString(),
      },
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Confirm payment and complete transaction
 * @route   POST /api/transactions/confirm-payment
 * @access  Private
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Verify payment status
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: `Payment not successful. Status: ${paymentIntent.status}`
      });
    }
    
    // Extract metadata
    const { bookId, buyerId, sellerId } = paymentIntent.metadata;
    
    // Verify the buyer is the current user
    if (buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to confirm this payment'
      });
    }

    // Check if transaction already exists (prevent duplicate confirmations)
    const existingTransaction = await Transaction.findOne({
      paymentId: paymentIntentId
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        error: 'This transaction has already been processed'
      });
    }
    
    // Process the successful payment
    const transaction = await processSuccessfulPayment(paymentIntent);
    
    res.json({
      success: true,
      message: 'Payment confirmed and transaction completed',
      data: transaction
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Process a failed payment (client-side notification)
 * @route   POST /api/transactions/payment-failed
 * @access  Private
 */
exports.notifyPaymentFailed = async (req, res) => {
  try {
    const { paymentIntentId, errorMessage } = req.body;
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Extract metadata
    const { bookId, buyerId, sellerId } = paymentIntent.metadata;
    
    // Verify the buyer is the current user
    if (buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to notify about this payment'
      });
    }
    
    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({
      paymentId: paymentIntentId
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        error: 'This transaction has already been processed'
      });
    }
    
    // Create transaction with failed status
    const transaction = new Transaction({
      book: bookId,
      buyer: buyerId,
      seller: sellerId,
      amount: paymentIntent.amount / 100,
      status: 'failed',
      paymentMethod: 'stripe',
      paymentId: paymentIntentId,
      currency: paymentIntent.currency,
      metadata: {
        stripePaymentIntentId: paymentIntentId,
        errorMessage: errorMessage || paymentIntent.last_payment_error?.message
      }
    });
    
    await transaction.save();
    
    // Add transaction to buyer's and seller's transactions
    await User.findByIdAndUpdate(buyerId, {
      $addToSet: { transactions: transaction._id }
    });
    
    await User.findByIdAndUpdate(sellerId, {
      $addToSet: { transactions: transaction._id }
    });
    
    console.log(`Payment failed for book: ${bookId}`);
    
    res.json({
      success: true,
      message: 'Payment failure recorded',
      data: transaction
    });
  } catch (error) {
    console.error('Error processing failed payment notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get user's transactions
 * @route   GET /api/transactions
 * @access  Private
 */
exports.getUserTransactions = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filter
    const filter = {
      $or: [{ buyer: req.user.id }, { seller: req.user.id }]
    };
    
    if (req.query.role === 'buyer') {
      filter.$or = [{ buyer: req.user.id }];
    } else if (req.query.role === 'seller') {
      filter.$or = [{ seller: req.user.id }];
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Execute query
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('book', 'title author coverImage price')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');
    
    // Get total count
    const total = await Transaction.countDocuments(filter);
    
    res.json({
      success: true,
      count: transactions.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('book', 'title author coverImage price')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Check if user is buyer or seller
    if (
      transaction.buyer._id.toString() !== req.user.id &&
      transaction.seller._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this transaction'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Process successful payment and create transaction
 * @param   {Object} paymentIntent - The Stripe payment intent object
 * @returns {Object} The created transaction
 */
const processSuccessfulPayment = async (paymentIntent) => {
  const { bookId, buyerId, sellerId } = paymentIntent.metadata;
  
  // Create transaction
  const transaction = new Transaction({
    book: bookId,
    buyer: buyerId,
    seller: sellerId,
    amount: paymentIntent.amount / 100, // Convert back from cents
    status: 'completed',
    paymentMethod: 'stripe',
    paymentId: paymentIntent.id,
    currency: paymentIntent.currency,
    receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
    metadata: {
      stripePaymentIntentId: paymentIntent.id
    }
  });
  
  await transaction.save();
  
  // Update book status
  await Book.findByIdAndUpdate(bookId, { status: 'sold' });
  
  // Add book to buyer's purchasedBooks
  await User.findByIdAndUpdate(buyerId, {
    $addToSet: { purchasedBooks: bookId, transactions: transaction._id }
  });
  
  // Add transaction to seller's transactions
  await User.findByIdAndUpdate(sellerId, {
    $addToSet: { transactions: transaction._id }
  });
  
  console.log(`Payment succeeded for book: ${bookId}`);
  
  return transaction;
};

/**
 * @desc    Refund transaction
 * @route   POST /api/transactions/:id/refund
 * @access  Private/Admin
 */
exports.refundTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Check if transaction is completed and not already refunded
    if (transaction.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Transaction cannot be refunded'
      });
    }
    
    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transaction.metadata.stripePaymentIntentId,
    });
    
    // Update transaction status
    transaction.status = 'refunded';
    transaction.metadata.refundId = refund.id;
    await transaction.save();
    
    // Update book status back to available
    await Book.findByIdAndUpdate(transaction.book, { status: 'available' });
    
    // Remove book from buyer's purchasedBooks
    await User.findByIdAndUpdate(transaction.buyer, {
      $pull: { purchasedBooks: transaction.book }
    });
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error refunding transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 