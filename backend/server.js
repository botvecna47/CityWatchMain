const express = require('express');
const cors = require('cors');
require('dotenv').config();
const {
  generalLimiter,
  authLimiter,
  apiLimiter,
  sensitiveLimiter,
} = require('./middleware/rateLimiter');
const { sanitizeAll } = require('./middleware/sanitize');
const { errorHandler } = require('./middleware/errorHandler');
const { securityHeaders } = require('./middleware/securityHeaders');
const { checkTokenBlacklist } = require('./middleware/tokenBlacklist');

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    '❌ Missing required environment variables:',
    missingEnvVars.join(', ')
  );
  console.error(
    'Please check your .env file and ensure all required variables are set.'
  );
  process.exit(1);
}

// Validate JWT secret strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error(
    '❌ JWT_SECRET must be at least 32 characters long for security.'
  );
  process.exit(1);
}

if (
  process.env.JWT_REFRESH_SECRET &&
  process.env.JWT_REFRESH_SECRET.length < 32
) {
  console.error(
    '❌ JWT_REFRESH_SECRET must be at least 32 characters long for security.'
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ];
    
    // Add production origins if in production
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
};

app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(sanitizeAll); // Sanitize all input data

// Security headers
app.use(securityHeaders);

// Token blacklist check for all API routes
app.use('/api', checkTokenBlacklist);

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/auth/reset-password', sensitiveLimiter);
app.use('/api/auth/change-password', sensitiveLimiter);
app.use(generalLimiter);

// Secure static file serving
const path = require('path');
const fs = require('fs');

// Validate file path to prevent directory traversal
const validateFilePath = (req, res, next) => {
  const requestedPath = req.path;
  
  // Check for directory traversal attempts
  if (requestedPath.includes('..') || requestedPath.includes('~')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Check for dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar'];
  const fileExtension = path.extname(requestedPath).toLowerCase();
  
  if (dangerousExtensions.includes(fileExtension)) {
    return res.status(403).json({ error: 'File type not allowed' });
  }
  
  next();
};

// Cache static files with security headers
const staticOptions = {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Security headers for static files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    // Prevent execution of uploaded files
    const ext = path.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      res.setHeader('Content-Type', 'image/' + ext.substring(1));
    } else if (['.pdf'].includes(ext)) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
};

// Serve static files with validation
app.use('/uploads', validateFilePath, express.static(path.join(__dirname, 'uploads'), staticOptions));
app.use('/assets', validateFilePath, express.static(path.join(__dirname, 'assets'), staticOptions));

// Secure CORS headers for static files
app.use('/assets', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Routes
app.use('/api', require('./routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
