const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './server/.env' });

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the user and update role to admin
      const updatedUser = await User.findOneAndUpdate(
        { email: 'testadmin@example.com' },
        { role: 'admin' },
        { new: true }
      );
      
      if (updatedUser) {
        console.log('User updated successfully:');
        console.log(`Email: ${updatedUser.email}`);
        console.log(`Role: ${updatedUser.role}`);
      } else {
        console.log('User not found');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 