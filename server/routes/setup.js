const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// This is a one-time setup route that should be disabled after use
// It uses a secure token to prevent unauthorized access
router.post('/admin-setup/:setupToken', async (req, res) => {
  try {
    // Verify setup token (should match environment variable)
    const setupToken = req.params.setupToken;
    const expectedToken = process.env.SETUP_TOKEN;
    
    if (!expectedToken || setupToken !== expectedToken) {
      return res.status(403).json({
        success: false,
        error: 'Invalid setup token'
      });
    }
    
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminName || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: 'Admin environment variables not set'
      });
    }
    
    // Check if admin user already exists
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      // Update admin role if needed
      if (adminUser.role !== 'admin') {
        // Create audit log entry
        const auditLog = {
          action: 'role_update',
          previousRole: adminUser.role,
          newRole: 'admin',
          updatedAt: new Date(),
          notes: 'Updated via admin-setup endpoint'
        };
        
        // Add audit log to user document
        if (!adminUser.auditLogs) {
          adminUser.auditLogs = [];
        }
        adminUser.auditLogs.push(auditLog);
        
        // Update role
        adminUser.role = 'admin';
        await adminUser.save();
        
        return res.json({
          success: true,
          message: 'Existing user updated to admin role',
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role
          }
        });
      } else {
        return res.json({
          success: true,
          message: 'Admin user already exists',
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role
          }
        });
      }
    } else {
      // Create new admin user
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Create user
      adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        auditLogs: [{
          action: 'role_update',
          previousRole: 'user',
          newRole: 'admin',
          updatedAt: new Date(),
          notes: 'Created via admin-setup endpoint'
        }]
      });
      
      return res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 