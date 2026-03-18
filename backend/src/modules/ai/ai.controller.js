/**
 * BuildMyHome - AI Controller
 */

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const aiService = require('./ai.service');

const aiController = {
  /**
   * AI design suggestions
   */
  designSuggest: asyncHandler(async (req, res) => {
    const { budget, area, location, preferences } = req.body;
    const suggestions = await aiService.generateDesignSuggestions({ budget, area, location, preferences });
    ApiResponse.ok(res, 'AI design suggestions generated', { suggestions });
  }),

  /**
   * Cost estimation
   */
  costEstimate: asyncHandler(async (req, res) => {
    const { area, location, materials, floors } = req.body;
    const estimate = await aiService.calculateCostEstimate({ area, location, materials, floors });
    ApiResponse.ok(res, 'Cost estimate generated', estimate);
  }),

  /**
   * Material recommendations
   */
  materialRecommend: asyncHandler(async (req, res) => {
    const { budget, type, location, quantity } = req.body;
    const recommendations = await aiService.recommendMaterials({ budget, type, location, quantity });
    ApiResponse.ok(res, 'Material recommendations', recommendations);
  }),
};

module.exports = aiController;

