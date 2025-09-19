const express = require('express');
const router = express.Router();

// Import route modules here when they are created
router.use('/auth', require('./auth'));
router.use('/reports', require('./reports'));
router.use('/cities', require('./cities'));
router.use('/users', require('./users'));
router.use('/comments', require('./comments'));
router.use('/attachments', require('./attachments'));
router.use('/notifications', require('./notifications'));
router.use('/admin', require('./admin'));
router.use('/alerts', require('./alerts'));
router.use('/events', require('./events'));
router.use('/public', require('./public'));

module.exports = router;
