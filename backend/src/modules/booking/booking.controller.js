/**
 * BuildMyHome - Booking Controller
 * Request handlers for booking endpoints
 */

const bookingService = require('./booking.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Create new booking
 */
const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.userId, req.body);
  ApiResponse.created(res, 'Booking created successfully', booking);
});

/**
 * Get booking by ID
 */
const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await bookingService.getBookingById(id);
  ApiResponse.ok(res, 'Booking retrieved successfully', booking);
});

/**
 * Get user's bookings
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const result = await bookingService.getUserBookings(req.userId, {}, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });
  ApiResponse.paginated(res, 'Bookings retrieved successfully', result.bookings, result.pagination);
});

/**
 * Get engineer's bookings
 */
const getEngineerBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, startDate, endDate } = req.query;
  const result = await bookingService.getEngineerBookings(req.userId, {}, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    startDate,
    endDate,
  });
  ApiResponse.paginated(res, 'Bookings retrieved successfully', result.bookings, result.pagination);
});

/**
 * Check availability
 */
const checkAvailability = asyncHandler(async (req, res) => {
  const { engineerId } = req.params;
  const { date } = req.query;
  if (!date) {
    return ApiResponse.badRequest(res, 'Date is required');
  }
  const slots = await bookingService.checkAvailability(engineerId, new Date(date));
  ApiResponse.ok(res, 'Availability retrieved successfully', slots);
});

/**
 * Confirm booking
 */
const confirmBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { meetingLink } = req.body;
  const booking = await bookingService.confirmBooking(id, req.userId, meetingLink);
  ApiResponse.ok(res, 'Booking confirmed successfully', booking);
});

/**
 * Cancel booking
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const booking = await bookingService.cancelBooking(id, req.userId, reason, req.user.role);
  ApiResponse.ok(res, 'Booking cancelled successfully', booking);
});

/**
 * Update booking status
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, ...additionalData } = req.body;
  const booking = await bookingService.updateStatus(id, status, additionalData);
  ApiResponse.ok(res, 'Booking status updated successfully', booking);
});

/**
 * Get booking statistics
 */
const getStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const stats = await bookingService.getStatistics(req.userId, startDate, endDate);
  ApiResponse.ok(res, 'Statistics retrieved successfully', stats);
});

module.exports = {
  createBooking,
  getBookingById,
  getMyBookings,
  getEngineerBookings,
  checkAvailability,
  confirmBooking,
  cancelBooking,
  updateBookingStatus,
  getStatistics,
};

