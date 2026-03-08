/**
 * BuildMyHome - Notification Routes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Protected routes - authentication required
router.get('/', authenticate, notificationController.getNotifications);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/delete-all', authenticate, notificationController.deleteAllNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;

