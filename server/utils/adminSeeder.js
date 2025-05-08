/**
 * Admin Seeder Script
 * 
 * This script creates or updates an admin user in the database.
 * It should be run with environment variables for security:
 * 
 * Usage:
 * ADMIN_EMAIL=admin@example.com ADMIN_NAME="Admin User" ADMIN_PASSWORD=securepassword node utils/adminSeeder.js
 * 
 * If no environment variables are provided, it will use the defaults below.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Get admin credentials from environment variables or use defaults
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminName = process.env.ADMIN_NAME || 'Admin User';
const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Import User model
      const User = require('../models/User');
      
      // Check if admin user already exists
      let adminUser = await User.findOne({ email: adminEmail });
      
      if (adminUser) {
        console.log(`Admin user with email ${adminEmail} already exists.`);
        
        // Update admin role if needed
        if (adminUser.role !== 'admin') {
          console.log('Updating user role to admin...');
          
          // Create audit log entry
          const auditLog = {
            action: 'role_update',
            previousRole: adminUser.role,
            newRole: 'admin',
            updatedBy: adminUser._id, // Self-update in this case
            updatedAt: new Date(),
            notes: 'Updated via adminSeeder.js script'
          };
          
          // Add audit log to user document
          if (!adminUser.auditLogs) {
            adminUser.auditLogs = [];
          }
          adminUser.auditLogs.push(auditLog);
          
          // Update role
          adminUser.role = 'admin';
          await adminUser.save();
          
          console.log('User role updated to admin successfully.');
        } else {
          console.log('User already has admin role. No changes needed.');
        }
      } else {
        // Create new admin user
        console.log(`Creating new admin user with email ${adminEmail}...`);
        
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
            notes: 'Created via adminSeeder.js script'
          }]
        });
        
        console.log('Admin user created successfully.');
      }
      
      console.log('Admin user details:');
      console.log(`Name: ${adminUser.name}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Role: ${adminUser.role}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 