const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createErrorResponse, ERROR_CODES } = require('./errorHandler');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '../assets/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Configure multer for file uploads with memory storage for validation
const storage = multer.memoryStorage();

// Enhanced file validation function with content validation
const validateFile = (file) => {
  const errors = [];

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(
      'Invalid file extension. Only JPG, PNG, and PDF files are allowed.'
    );
  }

  // Check MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Invalid file type. Only JPG, PNG, and PDF files are allowed.');
  }

  // Check filename for dangerous characters
  const dangerousChars = /[<>:"/\\|?*]/;
  if (dangerousChars.test(file.originalname)) {
    errors.push('Filename contains invalid characters.');
  }

  // Check for executable file extensions (additional security)
  const executableExtensions = [
    '.exe',
    '.bat',
    '.cmd',
    '.com',
    '.scr',
    '.pif',
    '.vbs',
    '.js',
    '.jar'
  ];
  if (executableExtensions.includes(fileExtension)) {
    errors.push('Executable files are not allowed.');
  }

  // Check filename length
  if (file.originalname.length > 255) {
    errors.push('Filename too long. Maximum 255 characters allowed.');
  }

  // Validate file content by checking magic bytes
  if (file.buffer) {
    const magicBytes = file.buffer.slice(0, 10);

    // Check for image magic bytes
    if (file.mimetype.startsWith('image/')) {
      const imageMagicBytes = {
        'image/jpeg': [0xff, 0xd8, 0xff],
        'image/png': [0x89, 0x50, 0x4e, 0x47],
        'image/gif': [0x47, 0x49, 0x46]
      };

      const expectedBytes = imageMagicBytes[file.mimetype];
      if (expectedBytes) {
        const isValid = expectedBytes.every(
          (byte, index) => magicBytes[index] === byte
        );
        if (!isValid) {
          errors.push('File content does not match the declared file type.');
        }
      }
    }

    // Check for PDF magic bytes
    if (file.mimetype === 'application/pdf') {
      const pdfMagicBytes = [0x25, 0x50, 0x44, 0x46]; // %PDF
      const isValid = pdfMagicBytes.every(
        (byte, index) => magicBytes[index] === byte
      );
      if (!isValid) {
        errors.push('File content does not match the declared file type.');
      }
    }
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
  },
});

// Post-processing middleware to save files after validation
const saveValidatedFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const savedFiles = [];

  req.files.forEach((file) => {
    try {
      // Generate secure filename
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const filename = `report_${timestamp}_${crypto.randomBytes(8).toString('hex')}${extension}`;
      const filepath = path.join(reportsDir, filename);

      // Save file to disk
      fs.writeFileSync(filepath, file.buffer);

      // Update file object with saved path
      file.filename = filename;
      file.filepath = filepath;
      file.destination = reportsDir;

      savedFiles.push(file);
    } catch (error) {
      console.error('Error saving file:', error);
      // Clean up any partially saved files
      savedFiles.forEach((savedFile) => {
        try {
          if (fs.existsSync(savedFile.filepath)) {
            fs.unlinkSync(savedFile.filepath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      });
      return res
        .status(500)
        .json(
          createErrorResponse(
            'Failed to save uploaded files',
            ERROR_CODES.UPLOAD_FAILED,
            500
          )
        );
    }
  });

  req.files = savedFiles;
  next();
};

// Middleware for handling upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(400)
        .json(
          createErrorResponse(
            'File size too large. Maximum size is 5MB.',
            ERROR_CODES.FILE_TOO_LARGE,
            400
          )
        );
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res
        .status(400)
        .json(
          createErrorResponse(
            'Too many files. Maximum 5 files allowed.',
            ERROR_CODES.UPLOAD_FAILED,
            400
          )
        );
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res
        .status(400)
        .json(
          createErrorResponse(
            'Unexpected field name for file upload.',
            ERROR_CODES.UPLOAD_FAILED,
            400
          )
        );
    }
  }

  if (
    error.message.includes('Invalid file type') ||
    error.message.includes('Invalid file extension')
  ) {
    return res
      .status(400)
      .json(
        createErrorResponse(error.message, ERROR_CODES.INVALID_FILE_TYPE, 400)
      );
  }

  next(error);
};

module.exports = {
  upload,
  saveValidatedFiles,
  handleUploadError
};
