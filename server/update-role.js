const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isEmailVerified: Boolean
});

// Create User model
const User = mongoose.model('User', userSchema);

async function updateUserRole() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the user and update role to admin
    const updatedUser = await User.findOneAndUpdate(
      { name: "Test Admin" },
      { role: "admin" },
      { new: true }
    );
    
    if (updatedUser) {
      console.log('User updated successfully:');
      console.log(`Name: ${updatedUser.name}`);
      console.log(`Email: ${updatedUser.email}`);
      console.log(`Role: ${updatedUser.role}`);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

updateUserRole(); 