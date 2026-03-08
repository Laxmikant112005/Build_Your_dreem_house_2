/**
 * BuildMyHome - Notification Controller
 * Request handlers for notification endpoints
 */

const notificationService = require('./notification.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get all notifications for current user
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  
  const result = await notificationService.getNotifications(req.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    unreadOnly: unreadOnly === 'true',
  });

  ApiResponse.ok(res, 'Notifications retrieved successfully', result);
});

/**
 * Mark notification as read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const notification = await notificationService.markAsRead(id, req.userId);
  ApiResponse.ok(res, 'Notification marked as read', notification);
});

/**
 * Mark all notifications as read
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.userId);
  ApiResponse.ok(res, 'All notifications marked as read');
});

/**
 * Delete notification
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await notificationService.deleteNotification(id, req.userId);
  
  if (!result) {
    return ApiResponse.notFound(res, 'Notification not found');
  }
  
  ApiResponse.ok(res, 'Notification deleted successfully');
});

/**
 * Delete all notifications
 */
const deleteAllNotifications = asyncHandler(async (req, res) => {
  await notificationService.deleteAllNotifications(req.userId);
  ApiResponse.ok(res, 'All notifications deleted successfully');
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};

