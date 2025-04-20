const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const bookCount = await Book.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');
    
    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('book', 'title price');
    
    // Get revenue stats (for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenueStats = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          transactionCount: 1,
          averageTransaction: { $round: ['$averageTransaction', 2] }
        }
      }
    ]);
    
    // Get book stats
    const bookStats = await Book.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        counts: {
          users: userCount,
          books: bookCount,
          transactions: transactionCount
        },
        recentUsers,
        recentTransactions,
        revenueStats: revenueStats[0] || { totalRevenue: 0, transactionCount: 0, averageTransaction: 0 },
        bookStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filter
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isEmailVerified) filter.isEmailVerified = req.query.isEmailVerified === 'true';
    
    // Search
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .select('-password');
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all books
// @route   GET /api/admin/books
// @access  Private/Admin
exports.getBooks = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filter
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    
    // Search
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { author: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('seller', 'name email');
    
    // Get total count
    const total = await Book.countDocuments(filter);
    
    res.json({
      success: true,
      count: books.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getTransactions = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filter
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    
    // Date range
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Execute query
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('book', 'title price');
    
    // Get total count
    const total = await Transaction.countDocuments(filter);
    
    // Calculate total amount if requested
    let totalAmount = 0;
    if (req.query.calculateTotal === 'true') {
      const amountData = await Transaction.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      if (amountData.length > 0) {
        totalAmount = amountData[0].total;
      }
    }
    
    res.json({
      success: true,
      count: transactions.length,
      total,
      totalAmount,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update book status (Admin only)
// @route   PUT /api/admin/books/:id/status
// @access  Private/Admin
exports.updateBookStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['available', 'sold', 'unavailable'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be available, sold, or unavailable'
      });
    }
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    book.status = status;
    await book.save();
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete book (Admin only)
// @route   DELETE /api/admin/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    // Remove book from seller's sellingBooks array
    await User.findByIdAndUpdate(book.seller, {
      $pull: { sellingBooks: book._id }
    });
    
    // Delete book
    await book.remove();
    
    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update transaction status
// @route   PUT /api/admin/transactions/:id/status
// @access  Private/Admin
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find transaction
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Check if status is valid
    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    // Update status
    transaction.status = status;
    await transaction.save();
    
    // If transaction is completed and it wasn't before
    if (status === 'completed' && transaction.status !== 'completed') {
      // Update book status to sold
      await Book.findByIdAndUpdate(transaction.book, { status: 'sold' });
      
      // Add book to buyer's purchasedBooks array
      await User.findByIdAndUpdate(transaction.buyer, {
        $addToSet: { purchasedBooks: transaction.book }
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 