const express = require('express');
const router = express.Router();

// Import route modules here when they are created
router.use('/auth', require('./auth'));
// router.use('/reports', require('./reports'));

module.exports = router;
