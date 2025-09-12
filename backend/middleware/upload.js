const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createErrorResponse, ERROR_CODES } = require('./errorHandler');

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

// Enhanced file validation function
const validateFile = (file) => {
  const errors = [];
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push('Invalid file extension. Only JPG, PNG, and PDF files are allowed.');
  }
  
  // Check MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Invalid file type. Only JPG, PNG, and PDF files are allowed.');
  }
  
  // Check filename for dangerous characters
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(file.originalname)) {
    errors.push('Filename contains invalid characters.');
  }
  
  // Check for executable file extensions (additional security)
  const executableExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar'];
  if (executableExtensions.includes(fileExtension)) {
    errors.push('Executable files are not allowed.');
  }
  
  // Check filename length
  if (file.originalname.length > 255) {
    errors.push('Filename too long. Maximum 255 characters allowed.');
  }
  
  return errors;
};

// File filter for allowed types with enhanced validation
const fileFilter = (req, file, cb) => {
  const errors = validateFile(file);
  
  if (errors.length === 0) {
    cb(null, true);
  } else {
    cb(new Error(errors.join(' ')), false);
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
      return res.status(400).json(createErrorResponse(
        'File size too large. Maximum size is 5MB.',
        ERROR_CODES.FILE_TOO_LARGE,
        400
      ));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(createErrorResponse(
        'Too many files. Maximum 5 files allowed.',
        ERROR_CODES.UPLOAD_FAILED,
        400
      ));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json(createErrorResponse(
        'Unexpected field name for file upload.',
        ERROR_CODES.UPLOAD_FAILED,
        400
      ));
    }
  }
  
  if (error.message.includes('Invalid file type') || error.message.includes('Invalid file extension')) {
    return res.status(400).json(createErrorResponse(
      error.message,
      ERROR_CODES.INVALID_FILE_TYPE,
      400
    ));
  }
  
  next(error);
};

module.exports = {
  upload,
  handleUploadError
};

