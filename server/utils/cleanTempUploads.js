/**
 * Utility function to clean up temporary upload files
 * This helps prevent the temp directory from growing too large
 */

const fs = require('fs');
const path = require('path');

// Clean files older than 1 hour (in milliseconds)
const MAX_AGE = 60 * 60 * 1000;

const cleanTempUploads = () => {
  const tempDir = path.join(__dirname, '../temp-uploads');
  
  // Check if directory exists
  if (!fs.existsSync(tempDir)) {
    return;
  }

  try {
    const now = Date.now();
    const files = fs.readdirSync(tempDir);
    
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      
      // Skip directories
      if (fs.statSync(filePath).isDirectory()) {
        return;
      }
      
      // Get file stats
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;
      
      // Delete if older than MAX_AGE
      if (fileAge > MAX_AGE) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} temporary files from ${tempDir}`);
    }
  } catch (error) {
    console.error('Error cleaning temporary uploads:', error);
  }
};

module.exports = cleanTempUploads; 