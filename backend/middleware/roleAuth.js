const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

const requireAuthority = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!['authority', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Authority or admin access required' });
  }

  next();
};

const requireCitizen = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'citizen') {
    return res.status(403).json({ error: 'Citizen access required' });
  }

  next();
};

module.exports = {
  requireAdmin,
  requireAuthority,
  requireCitizen
};