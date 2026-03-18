const express = require('express');
const router = express.Router();

// Import and use route modules (add as needed)
// const authRoutes = require('./auth');
// router.use('/auth', authRoutes);

// const adminRoutes = require('./admin');
// router.use('/admin', adminRoutes);

// TODO: Add other routes like ai, availability, booking, etc.

// Basic catch-all for unmatched routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = router;

