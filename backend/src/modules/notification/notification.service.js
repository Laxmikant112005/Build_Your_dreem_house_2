/**
 * BuildMyHome - Notification Service
 * Business logic for notification operations
 */

const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../../constants/enums');
const { getIO } = require('../../sockets');
const logger = require('../../utils/logger');

// Notification schema (stored in-memory or can be moved to database)
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
}, {
  timestamps: true,
});

// Create model only if not exists (avoids overwrite in tests)
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(userId, type, title, message, data = {}) {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
    });

    // Send real-time notification via Socket.io
    this.sendRealTimeNotification(userId, {
      id: notification._id,
      type,
      title,
      message,
      data,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  /**
   * Send real-time notification via Socket.io
   */
  sendRealTimeNotification(userId, notification) {
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('notification', notification);
        logger.info(`Real-time notification sent to user ${userId}`);
      }
    } catch (error) {
      logger.warn('Socket.io not available for real-time notification');
    }
  }

  /**
   * Get notifications for user
   */
  async getNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;
    
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date() 
        } 
      },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return true;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    return result !== null;
  }

  /**
   * Delete all notifications for user
   */
  async deleteAllNotifications(userId) {
    await Notification.deleteMany({ userId });
    return true;
  }

  /**
   * Send booking notification
   */
  async sendBookingNotification(booking, notificationType) {
    const bookingData = {
      bookingId: booking._id,
      engineerId: booking.engineerId,
      userId: booking.userId,
      scheduledDate: booking.scheduledDate,
      type: booking.type,
    };

    let title, message;

    switch (notificationType) {
      case 'booking_created':
        title = 'New Booking Request';
        message = `You have a new booking request for ${booking.type}`;
        await this.createNotification(booking.engineerId, NOTIFICATION_TYPES.BOOKING, title, message, bookingData);
        break;

      case 'booking_confirmed':
        title = 'Booking Confirmed';
        message = `Your booking for ${booking.type} has been confirmed`;
        await this.createNotification(booking.userId, NOTIFICATION_TYPES.BOOKING, title, message, bookingData);
        break;

      case 'booking_cancelled':
        title = 'Booking Cancelled';
        message = `A booking has been cancelled`;
        const cancelUserId = booking.userId;
        const cancelEngineerId = booking.engineerId;
        await this.createNotification(cancelEngineerId, NOTIFICATION_TYPES.BOOKING, title, message, bookingData);
        await this.createNotification(cancelUserId, NOTIFICATION_TYPES.BOOKING, title, message, bookingData);
        break;

      case 'booking_completed':
        title = 'Booking Completed';
        message = `Your booking for ${booking.type} has been completed`;
        await this.createNotification(booking.userId, NOTIFICATION_TYPES.BOOKING, title, message, bookingData);
        break;

      default:
        title = 'Booking Update';
        message = 'Your booking has been updated';
        await this.createNotification(booking.userId, NOTIFICATION_TYPES.BOOKING, title, message, bookingData);
    }
  }

  /**
   * Send review notification
   */
  async sendReviewNotification(review) {
    const reviewData = {
      reviewId: review._id,
      engineerId: review.engineerId,
      userId: review.userId,
      rating: review.rating,
    };

    await this.createNotification(
      review.engineerId,
      NOTIFICATION_TYPES.REVIEW,
      'New Review',
      `You received a ${review.rating}-star review`,
      reviewData
    );
  }

  /**
   * Send design notification
   */
  async sendDesignNotification(engineerId, design, notificationType) {
    const designData = {
      designId: design._id,
      title: design.title,
    };

    let title, message;

    switch (notificationType) {
      case 'design_approved':
        title = 'Design Approved';
        message = `Your design "${design.title}" has been approved`;
        break;
      case 'design_rejected':
        title = 'Design Rejected';
        message = `Your design "${design.title}" has been rejected`;
        break;
      case 'design_submitted':
        title = 'Design Submitted for Review';
        message = `Your design "${design.title}" is pending approval`;
        break;
    }

    if (title && message) {
      await this.createNotification(engineerId, NOTIFICATION_TYPES.DESIGN, title, message, designData);
    }
  }
}

module.exports = new NotificationService();

