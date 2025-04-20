const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('purchasedBooks', 'title author coverImage')
      .populate('sellingBooks', 'title author coverImage price status')
      .populate({
        path: 'transactions',
        select: 'amount status paymentMethod createdAt',
        options: { sort: { createdAt: -1 }, limit: 5 }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profileImage: user.profileImage,
        wallet: user.wallet,
        isEmailVerified: user.isEmailVerified,
        purchasedBooks: user.purchasedBooks,
        sellingBooks: user.sellingBooks,
        recentTransactions: user.transactions,
        ratings: user.ratings,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('purchasedBooks', 'title author coverImage')
      .populate('sellingBooks', 'title author coverImage price status')
      .populate('transactions', 'amount status createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, profileImage } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user wallet
// @route   PUT /api/users/wallet
// @access  Private
exports.updateWallet = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update wallet
    user.wallet.balance = amount;
    if (currency) user.wallet.currency = currency;

    await user.save();

    res.json({
      success: true,
      data: {
        wallet: user.wallet
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user's purchased books
// @route   GET /api/users/purchased-books
// @access  Private
exports.getPurchasedBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'purchasedBooks',
      select: 'title author coverImage price'
    });

    res.json({
      success: true,
      count: user.purchasedBooks.length,
      data: user.purchasedBooks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user's selling books
// @route   GET /api/users/selling-books
// @access  Private
exports.getSellingBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'sellingBooks',
      select: 'title author coverImage price status'
    });

    res.json({
      success: true,
      count: user.sellingBooks.length,
      data: user.sellingBooks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user's transactions
// @route   GET /api/users/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'transactions',
      select: 'amount status paymentMethod createdAt',
      populate: {
        path: 'book',
        select: 'title author coverImage'
      }
    });

    res.json({
      success: true,
      count: user.transactions.length,
      data: user.transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has any active books or transactions
    const hasActiveBooks = await Book.exists({ seller: user._id, status: 'available' });
    const hasActiveTransactions = await Transaction.exists({
      $or: [{ buyer: user._id }, { seller: user._id }],
      status: 'pending'
    });

    if (hasActiveBooks || hasActiveTransactions) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete user with active books or transactions'
      });
    }

    await user.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          avgRating: { $avg: '$ratings.average' }
        }
      },
      {
        $project: {
          _id: 0,
          role: '$_id',
          count: 1,
          avgRating: { $round: ['$avgRating', 2] }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current user (auth user)
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // Since auth middleware attaches the user to req, we can simply return it
    // We don't need to find the user again
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 