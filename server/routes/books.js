const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middlewares/auth');
const { multerErrorHandler } = require('../middlewares/error');
const { 
  createBookValidation, 
  updateBookValidation, 
  reviewValidation,
  validate
} = require('../utils/validators');
const { cloudinary, upload } = require('../config/cloudinary');

// Add debugging middleware
const debugRequest = (req, res, next) => {
  console.log('Request body:', req.body);
  next();
};

// Custom Cloudinary upload middleware
const cloudinaryUpload = (req, res, next) => {
  // Multer will parse the form data first
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    try {
      if (!req.files || !req.files.coverImage || !req.files.pdfFile) {
        return res.status(400).json({
          success: false, 
          error: 'Please upload both cover image and PDF file'
        });
      }

      // Upload cover image to Cloudinary
      const coverResult = await cloudinary.uploader.upload(req.files.coverImage[0].path, {
        folder: 'book-marketplace/covers',
        transformation: [{ width: 500, height: 700, crop: 'limit' }]
      });

      // Upload PDF to Cloudinary
      const pdfResult = await cloudinary.uploader.upload(req.files.pdfFile[0].path, {
        folder: 'book-marketplace/pdfs',
        resource_type: 'raw'
      });

      // Add Cloudinary URLs to the request body
      req.body.coverImage = coverResult.secure_url;
      req.body.pdfFile = pdfResult.secure_url;
      
      // Store public IDs for potential deletion later
      req.body.coverImagePublicId = coverResult.public_id;
      req.body.pdfFilePublicId = pdfResult.public_id;

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error uploading files: ${error.message}`
      });
    }
  });
};

// Public routes
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBook);
router.get('/:id/reviews', bookController.getBookReviews);

// Protected routes (require authentication)
router.use(auth);

// Book CRUD operations
router.post('/', cloudinaryUpload, debugRequest, createBookValidation, validate, bookController.createBook);
router.put('/:id', cloudinaryUpload, updateBookValidation, validate, bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

// Reviews
router.post('/:id/reviews', reviewValidation, validate, bookController.addReview);

module.exports = router; 