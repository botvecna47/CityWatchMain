const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { generalLimiter, authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeAll } = require('./middleware/sanitize');
const { errorHandler } = require('./middleware/errorHandler');

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Validate JWT secret strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters long for security.');
  process.exit(1);
}

if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
  console.error('❌ JWT_REFRESH_SECRET must be at least 32 characters long for security.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(sanitizeAll); // Sanitize all input data

// Rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use(generalLimiter);

// Serve uploaded files statically with cache headers
const path = require('path');

// Cache static files for 1 hour
const staticOptions = {
  maxAge: '1h',
  etag: true,
  lastModified: true
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));
app.use('/assets', express.static(path.join(__dirname, 'assets'), staticOptions));

// Additional CORS headers for static files
app.use('/assets', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
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
