/**
 * Middleware to check if user has admin role
 * This middleware should be used after the auth middleware
 * to ensure req.user is available
 */
const admin = (req, res, next) => {
  // Check if user exists and has admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

module.exports = admin; 