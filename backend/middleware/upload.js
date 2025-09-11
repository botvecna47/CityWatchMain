const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '../assets/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reportsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with clear format: report_timestamp.extension
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `report_${timestamp}${extension}`);
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Middleware for handling upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum 5 files allowed.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name for file upload.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
};

module.exports = {
  upload,
  handleUploadError
};

