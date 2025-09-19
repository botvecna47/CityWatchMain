const jwt = require('jsonwebtoken');

// In-memory blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();

// Add token to blacklist
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

// Check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Middleware to check token blacklist
const checkTokenBlacklist = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        error: 'Token has been revoked. Please login again.'
      });
    }
  }
  
  next();
};

// Middleware to blacklist token on logout
const blacklistTokenOnLogout = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    blacklistToken(token);
  }
  
  next();
};

// Clean up expired tokens from blacklist (run periodically)
const cleanupExpiredTokens = () => {
  const now = Date.now();
  
  for (const token of tokenBlacklist) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp && decoded.exp * 1000 < now) {
        tokenBlacklist.delete(token);
      }
    } catch (error) {
      // Remove invalid tokens
      tokenBlacklist.delete(token);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  checkTokenBlacklist,
  blacklistTokenOnLogout,
  cleanupExpiredTokens
};
