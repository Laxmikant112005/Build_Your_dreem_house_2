/**
 * BuildMyHome - Design Suggestion Controller
 */

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const designService = require('./design.service');

const suggestionController = {
  suggestDesigns: asyncHandler(async (req, res) => {
    const {
      budget,
      area,
      style,
      facing,
      floors,
      type,
    } = req.body;

    // Validate required fields
    if (!budget || !area) {
      return ApiResponse.badRequest(res, 'Budget and area are required');
    }

    const suggestions = await designService.suggestDesigns({
      budget: parseFloat(budget),
      area: parseFloat(area),
      style,
      facing,
      floors: parseInt(floors),
      type,
    });

    ApiResponse.ok(res, 'Design suggestions generated', suggestions);
  }),
};

module.exports = suggestionController;

