/**
 * BuildMyHome - API Routes
 * Main router configuration
 */

const express = require('express');
const config = require('../config');

const router = express.Router();

// Import route modules
const authRoutes = require('../modules/auth/auth.route');
const userRoutes = require('../modules/user/user.route');
const engineerRoutes = require('../modules/engineer/engineer.route');
const designRoutes = require('../modules/design/design.route');
const bookingRoutes = require('../modules/booking/booking.route');
const reviewRoutes = require('../modules/review/review.route');
const chatRoutes = require('../modules/chat/chat.route');
const notificationRoutes = require('../modules/notification/notification.route');
const uploadRoutes = require('../modules/upload/upload.route');
const categoryRoutes = require('../modules/category/category.route');
const adminRoutes = require('../modules/admin/admin.route');
const recommendationRoutes = require('../modules/recommendation/recommendation.route');

// Mount routes
router.use(`/${config.apiVersion}/auth`, authRoutes);
router.use(`/${config.apiVersion}/users`, userRoutes);
router.use(`/${config.apiVersion}/engineers`, engineerRoutes);
router.use(`/${config.apiVersion}/designs`, designRoutes);
router.use(`/${config.apiVersion}/bookings`, bookingRoutes);
router.use(`/${config.apiVersion}/reviews`, reviewRoutes);
router.use(`/${config.apiVersion}/chats`, chatRoutes);
router.use(`/${config.apiVersion}/notifications`, notificationRoutes);
router.use(`/${config.apiVersion}/uploads`, uploadRoutes);
router.use(`/${config.apiVersion}/categories`, categoryRoutes);
router.use(`/${config.apiVersion}/admin`, adminRoutes);
router.use(`/${config.apiVersion}/recommendations`, recommendationRoutes);

// Health check
router.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

module.exports = router;

