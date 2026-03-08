/**
 * BuildMyHome - Booking Routes
 * API routes for booking endpoints
 */

const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { body, param, query } = require('express-validator');

// Public routes
router.get('/engineer/:engineerId/availability', 
  param('engineerId').isMongoId(),
  query('date').isISO8601(),
  validate,
  bookingController.checkAvailability
);

// Protected routes - User
router.get('/my-bookings', authenticate, bookingController.getMyBookings);
router.post('/', authenticate, bookingController.createBooking);

// Protected routes - Engineer
router.get('/engineer/my-bookings', authenticate, authorize('engineer', 'admin'), bookingController.getEngineerBookings);
router.post('/:id/confirm', authenticate, authorize('engineer'), param('id').isMongoId(), validate, bookingController.confirmBooking);

// Protected routes - All authenticated
router.get('/:id', authenticate, bookingController.getBookingById);
router.put('/:id/status', authenticate, authorize('engineer', 'admin'), param('id').isMongoId(), validate, bookingController.updateBookingStatus);
router.post('/:id/cancel', authenticate, param('id').isMongoId(), validate, bookingController.cancelBooking);
router.get('/engineer/stats', authenticate, authorize('engineer', 'admin'), bookingController.getStatistics);

module.exports = router;

