const User = require('../models/User');

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;
    
    // Validate role
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role specified. Role must be either "user" or "admin"'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prevent self-demotion (admin cannot remove their own admin privileges)
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You cannot remove your own admin privileges'
      });
    }
    
    // Update user role
    user.role = role;
    
    // Create audit log entry
    const auditLog = {
      action: 'role_update',
      previousRole: user.role,
      newRole: role,
      updatedBy: req.user._id,
      updatedAt: new Date()
    };
    
    // Add audit log to user document
    if (!user.auditLogs) {
      user.auditLogs = [];
    }
    user.auditLogs.push(auditLog);
    
    await user.save();
    
    res.json({
      success: true,
      message: `User role updated to ${role}`,
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

/**
 * @desc    Get user role audit logs
 * @route   GET /api/admin/users/:id/role-logs
 * @access  Private/Admin
 */
exports.getUserRoleAuditLogs = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Get audit logs
    const auditLogs = user.auditLogs || [];
    
    res.json({
      success: true,
      count: auditLogs.length,
      data: auditLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 