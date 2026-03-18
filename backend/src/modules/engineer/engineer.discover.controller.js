/**
 * BuildMyHome - Engineer Discovery Controller
 */

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const engineerService = require('./engineer.service');

const discoverController = {
  discoverEngineers: asyncHandler(async (req, res) => {
    const { lat, lng, minRating = 0, maxPricePerSqft = Infinity, designId } = req.query;

    if (!lat || !lng) {
      return ApiResponse.badRequest(res, 'Location (lat, lng) is required');
    }

    const engineers = await engineerService.discoverEngineers({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      minRating: parseFloat(minRating),
      maxPricePerSqft: parseFloat(maxPricePerSqft),
      designId,
    });

    ApiResponse.ok(res, 'Nearby engineers found', {
      engineers,
      filters: req.query,
    });
  }),
};

module.exports = discoverController;

