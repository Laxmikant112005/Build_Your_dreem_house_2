/**
 * BuildMyHome - Availability Controller
 */

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const availabilityService = require('./availability.service');

const availabilityController = {
  createSlot: asyncHandler(async (req, res) => {
    const slots = await availabilityService.createAvailability(req.body, req.user._id);
    ApiResponse.created(res, 'Availability created', slots);
  }),

  getAvailability: asyncHandler(async (req, res) => {
    const { engineerId, startDate, endDate } = req.query;
    const availability = await availabilityService.getEngineerAvailability(engineerId, startDate, endDate);
    ApiResponse.ok(res, 'Availability retrieved', availability);
  }),

  findSlots: asyncHandler(async (req, res) => {
    const slots = await availabilityService.findAvailableSlots(req.params.engineerId, req.query.date);
    ApiResponse.ok(res, 'Available slots', slots);
  }),
};

module.exports = availabilityController;

