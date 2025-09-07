const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Specific role middleware functions
const requireCitizen = roleAuth(['citizen']);
const requireAuthority = roleAuth(['authority', 'admin']);
const requireAdmin = roleAuth(['admin']);

module.exports = {
  roleAuth,
  requireCitizen,
  requireAuthority,
  requireAdmin
};
