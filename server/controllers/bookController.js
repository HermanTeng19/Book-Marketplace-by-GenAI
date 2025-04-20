const Book = require('../models/Book');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all books with filtering, sorting, pagination
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status = 'available', 
      minPrice, 
      maxPrice, 
      sort, 
      search 
    } = req.query;

    // Build query
    const query = { status: 'available' }; // Default to show only available books

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by custom status if authorized
    if (req.user && (req.user.role === 'admin' || status !== 'available')) {
      query.status = status;
    }

    // Filter by price range
    if (minPrice !== undefined) {
      query.price = { $gte: Number(minPrice) };
    }
    
    if (maxPrice !== undefined) {
      if (query.price) {
        query.price.$lte = Number(maxPrice);
      } else {
        query.price = { $lte: Number(maxPrice) };
      }
    }

    // Search by title, author, or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortOptions = { price: 1 };
          break;
        case 'price-desc':
          sortOptions = { price: -1 };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'rating':
          sortOptions = { averageRating: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    } else {
      // Default sort by newest
      sortOptions = { createdAt: -1 };
    }

    // Pagination setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const books = await Book.find(query)
      .populate('seller', 'name email profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Book.countDocuments(query);

    // Send response
    res.json({
      success: true,
      count: books.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
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

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('seller', 'name email profileImage')
      .populate({
        path: 'reviews.user',
        select: 'name profileImage'
      });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // If book is not available, only allow access to seller or admin
    if (book.status !== 'available') {
      if (!req.user || (req.user.role !== 'admin' && !book.seller._id.equals(req.user.id))) {
        return res.status(403).json({
          success: false,
          error: 'This book is no longer available'
        });
      }
    }

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

// @desc    Create a new book
// @route   POST /api/books
// @access  Private
exports.createBook = async (req, res) => {
  try {
    // Log request info to help debug
    console.log('Request body fields:', Object.keys(req.body));
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Full request body:', req.body);
    
    const { 
      title, 
      author, 
      description, 
      price, 
      category, 
      tags, 
      coverImage, 
      pdfFile,
      coverImagePublicId,
      pdfFilePublicId 
    } = req.body;
    
    // Verify required fields
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!author) missingFields.push('author');
    if (!description) missingFields.push('description');
    if (!price) missingFields.push('price');
    if (!category) missingFields.push('category');
    if (!coverImage) missingFields.push('coverImage');
    if (!pdfFile) missingFields.push('pdfFile');
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        receivedData: req.body
      });
    }

    // Create book
    const book = new Book({
      title,
      author,
      description,
      price,
      coverImage,
      coverImagePublicId,
      pdfFile,
      pdfFilePublicId,
      category,
      tags: tags ? JSON.parse(tags) : [],
      seller: req.user.id,
      status: 'available'
    });

    // Save book
    await book.save();

    // Update user's sellingBooks array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { sellingBooks: book._id }
    });

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error creating book:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
exports.updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Check if user is book seller or admin
    if (!book.seller.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this book'
      });
    }

    const { 
      title, 
      author, 
      description, 
      price, 
      category, 
      tags, 
      status,
      coverImage,
      pdfFile,
      coverImagePublicId,
      pdfFilePublicId 
    } = req.body;
    
    // Update fields
    if (title) book.title = title;
    if (author) book.author = author;
    if (description) book.description = description;
    if (price) book.price = price;
    if (category) book.category = category;
    if (tags) book.tags = JSON.parse(tags);
    
    // Only admin or seller can update status
    if (status && (req.user.role === 'admin' || book.seller.equals(req.user.id))) {
      book.status = status;
    }

    // Handle file updates if provided
    if (coverImage && coverImagePublicId) {
      // Delete old image if it exists
      if (book.coverImagePublicId) {
        await cloudinary.uploader.destroy(book.coverImagePublicId);
      }
      book.coverImage = coverImage;
      book.coverImagePublicId = coverImagePublicId;
    }
    
    if (pdfFile && pdfFilePublicId) {
      // Delete old PDF if it exists
      if (book.pdfFilePublicId) {
        await cloudinary.uploader.destroy(book.pdfFilePublicId, { resource_type: 'raw' });
      }
      book.pdfFile = pdfFile;
      book.pdfFilePublicId = pdfFilePublicId;
    }

    // Update timestamp
    book.updatedAt = Date.now();

    // Save updated book
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

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Only allow deletion by book seller or admin
    if (!book.seller.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this book'
      });
    }

    // Delete files from Cloudinary
    if (book.coverImagePublicId) {
      await cloudinary.uploader.destroy(book.coverImagePublicId);
    }
    
    if (book.pdfFilePublicId) {
      await cloudinary.uploader.destroy(book.pdfFilePublicId, { resource_type: 'raw' });
    }

    // Remove book from user's sellingBooks array
    await User.findByIdAndUpdate(book.seller, {
      $pull: { sellingBooks: book._id }
    });

    // Delete book
    await Book.findByIdAndDelete(book._id);

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

// @desc    Add review to book
// @route   POST /api/books/:id/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Check if user has purchased the book
    const user = await User.findById(req.user.id);
    if (!user.purchasedBooks.includes(book._id)) {
      return res.status(403).json({
        success: false,
        error: 'You can only review books you have purchased'
      });
    }

    // Check if user has already reviewed this book
    const existingReviewIndex = book.reviews.findIndex(
      review => review.user.toString() === req.user.id
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      book.reviews[existingReviewIndex].rating = rating;
      book.reviews[existingReviewIndex].comment = comment;
    } else {
      // Add new review
      book.reviews.push({
        user: req.user.id,
        rating,
        comment
      });
    }

    // Calculate new average rating
    book.calculateAverageRating();
    
    // Save changes
    await book.save();

    // Update seller's rating
    await updateSellerRating(book.seller);

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

// @desc    Get all reviews for a book
// @route   GET /api/books/:id/reviews
// @access  Public
exports.getBookReviews = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .select('reviews averageRating')
      .populate({
        path: 'reviews.user',
        select: 'name profileImage'
      });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: {
        reviews: book.reviews,
        averageRating: book.averageRating
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to update seller's average rating
async function updateSellerRating(sellerId) {
  try {
    // Get all books by this seller with reviews
    const books = await Book.find({ seller: sellerId });
    
    // Calculate average rating across all books
    let totalRatings = 0;
    let ratingCount = 0;
    
    books.forEach(book => {
      if (book.reviews.length > 0) {
        totalRatings += book.averageRating * book.reviews.length;
        ratingCount += book.reviews.length;
      }
    });
    
    const averageRating = ratingCount > 0 ? totalRatings / ratingCount : 0;
    
    // Update seller's rating
    await User.findByIdAndUpdate(sellerId, {
      'ratings.average': averageRating,
      'ratings.count': ratingCount
    });
  } catch (error) {
    console.error('Error updating seller rating:', error);
  }
} 