const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { generalLimiter, authLimiter, apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Routes
app.use('/api', require('./routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
