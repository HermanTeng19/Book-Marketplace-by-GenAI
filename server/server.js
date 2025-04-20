const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { multerErrorHandler } = require('./middlewares/error');
const cleanTempUploads = require('./utils/cleanTempUploads');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create temp directory for uploads if it doesn't exist
const tempUploadsDir = path.join(__dirname, 'temp-uploads');
if (!fs.existsSync(tempUploadsDir)) {
  fs.mkdirSync(tempUploadsDir, { recursive: true });
}

// Set up scheduled cleanup of temp uploads (every hour)
setInterval(cleanTempUploads, 60 * 60 * 1000);

// Middleware
app.use(express.json());
app.use(cors());

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/books', require('./routes/books'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/transactions', require('./routes/transactions'));

// Basic route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Book Marketplace API is running',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API test endpoint is working',
    data: {
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Clean temp uploads on startup
    cleanTempUploads();
    
    // Start server only after MongoDB connection is established
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Test the API at http://localhost:${PORT}/api/test`);
      console.log(`Auth API at http://localhost:${PORT}/api/auth`);
      console.log(`Users API at http://localhost:${PORT}/api/users`);
      console.log(`Books API at http://localhost:${PORT}/api/books`);
      console.log(`Admin API at http://localhost:${PORT}/api/admin`);
      console.log(`Transactions API at http://localhost:${PORT}/api/transactions`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  });

// Multer error handling middleware
app.use(multerErrorHandler);

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server Error'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});
