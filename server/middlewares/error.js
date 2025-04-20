/**
 * Error handling middleware for multer file upload errors
 */
const multerErrorHandler = (err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB'
      });
    }
    
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  // For non-multer errors, pass to next error handler
  next(err);
};

module.exports = { multerErrorHandler }; 