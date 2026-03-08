/**
 * BuildMyHome - Booking Service
 * Business logic for booking operations
 */

const Booking = require('./booking.model');
const ApiError = require('../../utils/ApiError');
const { BOOKING_STATUS } = require('../../constants/enums');
const { cache } = require('../../config/redis');
const notificationService = require('../notification/notification.service');

class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(userId, bookingData) {
    const booking = await Booking.create({
      ...bookingData,
      userId,
    });
    return booking;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId) {
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'firstName lastName email phone avatar')
      .populate('engineerId', 'firstName lastName email phone avatar engineerProfile')
      .populate('designId');

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    return booking;
  }

  /**
   * Get bookings for user
   */
  async getUserBookings(userId, filters = {}, options = {}) {
    const { page = 1, limit = 20, status } = options;
    const query = { userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('engineerId', 'firstName lastName avatar engineerProfile.rating')
        .populate('designId', 'title images'),
      Booking.countDocuments(query),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get bookings for engineer
   */
  async getEngineerBookings(engineerId, filters = {}, options = {}) {
    const { page = 1, limit = 20, status, startDate, endDate } = options;
    const query = { engineerId };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ scheduledDate: 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName avatar phone')
        .populate('designId', 'title images'),
      Booking.countDocuments(query),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check availability for engineer
   */
  async checkAvailability(engineerId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      engineerId,
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
    }).select('scheduledTime duration');

    // Generate available slots (9 AM to 6 PM, 1 hour slots)
    const bookedSlots = existingBookings.map(b => ({
      start: b.scheduledTime,
      end: this.addMinutes(b.scheduledTime, b.duration),
    }));

    const allSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const isBooked = bookedSlots.some(slot => {
        return this.isTimeOverlapping(time, slot.start, slot.end);
      });
      allSlots.push({
        time,
        available: !isBooked,
      });
    }

    return allSlots;
  }

  /**
   * Check if two time ranges overlap
   */
  isTimeOverlapping(time, start, end) {
    const t = this.parseTime(time);
    const s = this.parseTime(start);
    const e = this.parseTime(end);
    return t >= s && t < e;
  }

  /**
   * Parse time string to minutes
   */
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Add minutes to time string
   */
  addMinutes(timeStr, minutes) {
    const totalMinutes = this.parseTime(timeStr) + minutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Update booking status
   */
  async updateStatus(bookingId, status, additionalData = {}) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    booking.status = status;

    // Update timeline based on status
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        booking.timeline.confirmedAt = new Date();
        break;
      case BOOKING_STATUS.IN_PROGRESS:
        booking.timeline.startedAt = new Date();
        break;
      case BOOKING_STATUS.COMPLETED:
        booking.timeline.completedAt = new Date();
        break;
      case BOOKING_STATUS.CANCELLED:
        booking.timeline.cancelledAt = new Date();
        booking.timeline.cancellationReason = additionalData.reason || '';
        break;
    }

    // Update other fields
    if (additionalData.meetingLink) booking.meetingLink = additionalData.meetingLink;
    if (additionalData.notes) booking.notes = additionalData.notes;

    await booking.save();

    // Send notification
    const notificationType = status === BOOKING_STATUS.CONFIRMED ? 'booking_confirmed' : 
                           status === BOOKING_STATUS.CANCELLED ? 'booking_cancelled' : 
                           'booking_updated';
    
    await notificationService.sendBookingNotification(booking, notificationType);

    return booking;
  }

  /**
   * Confirm booking
   */
  async confirmBooking(bookingId, engineerId, meetingLink) {
    const booking = await Booking.findOne({ _id: bookingId, engineerId });
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new ApiError(400, 'Booking cannot be confirmed');
    }

    booking.status = BOOKING_STATUS.CONFIRMED;
    booking.timeline.confirmedAt = new Date();
    if (meetingLink) booking.meetingLink = meetingLink;
    await booking.save();

    // Send notification
    await notificationService.sendBookingNotification(booking, 'booking_confirmed');

    return booking;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId, reason, userRole) {
    const query = { _id: bookingId };
    
    // Only allow cancellation by booking owner or assigned engineer
    if (userRole === 'user') {
      query.userId = userId;
    } else if (userRole === 'engineer') {
      query.engineerId = userId;
    }

    const booking = await Booking.findOne(query);
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.status === BOOKING_STATUS.COMPLETED || booking.status === BOOKING_STATUS.CANCELLED) {
      throw new ApiError(400, 'Booking cannot be cancelled');
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    booking.timeline.cancelledAt = new Date();
    booking.timeline.cancellationReason = reason;
    await booking.save();

    // Send notification
    await notificationService.sendBookingNotification(booking, 'booking_cancelled');

    return booking;
  }

  /**
   * Get booking statistics
   */
  async getStatistics(engineerId, startDate, endDate) {
    const query = { engineerId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const stats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
        },
      },
    ]);

    return stats;
  }
}

module.exports = new BookingService();

