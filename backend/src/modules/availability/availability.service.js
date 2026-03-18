/**
 * BuildMyHome - Availability Service
 */

const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const Availability = require('./availability.model');
const Booking = require('../booking/booking.model');

const availabilityService = {
  // Create availability slot
  createAvailability: asyncHandler(async (data, engineerId) => {
    return await Availability.create({ ...data, engineerId });
  }),

  // Get engineer availability
  getEngineerAvailability: asyncHandler(async (engineerId, startDate, endDate) => {
    const availability = await Availability.find({
      engineerId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      status: 'available',
    }).sort({ date: 1, startTime: 1 });

    return availability;
  }),

  // Book slot (update status)
  bookSlot: asyncHandler(async (slotId, bookingId, engineerId) => {
    const slot = await Availability.findOne({ _id: slotId, engineerId, status: 'available' });
    if (!slot) throw new ApiError(400, 'Slot not available');
    
    slot.status = 'booked';
    slot.bookingId = bookingId;
    await slot.save();
    
    return slot;
  }),

  // Get available slots for booking
  findAvailableSlots: asyncHandler(async (engineerId, date) => {
    return await Availability.find({
      engineerId,
      date: new Date(date),
      status: 'available',
    });
  }),
};

module.exports = availabilityService;

