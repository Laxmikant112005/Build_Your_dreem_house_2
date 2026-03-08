/**
 * BuildMyHome - Recommendation Controller
 * Request handlers for recommendation endpoints
 */

const recommendationService = require('./recommendation.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get home page recommendations (featured + trending)
 */
const getHomeRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await recommendationService.getHomeRecommendations();
  ApiResponse.ok(res, 'Home recommendations retrieved successfully', recommendations);
});

/**
 * Get trending designs
 */
const getTrendingDesigns = asyncHandler(async (req, res) => {
  const { limit = 10, days = 7 } = req.query;

  const designs = await recommendationService.getTrendingDesigns(
    parseInt(days),
    parseInt(limit)
  );

  ApiResponse.ok(res, 'Trending designs retrieved successfully', designs);
});

/**
 * Get popular designs
 */
const getPopularDesigns = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const designs = await recommendationService.getPopularDesigns(parseInt(limit));

  ApiResponse.ok(res, 'Popular designs retrieved successfully', designs);
});

/**
 * Get design recommendations based on current design
 */
const getDesignRecommendations = asyncHandler(async (req, res) => {
  const { designId } = req.params;
  const { limit = 6 } = req.query;

  const recommendations = await recommendationService.getDesignRecommendations(
    designId,
    parseInt(limit)
  );

  ApiResponse.ok(res, 'Design recommendations retrieved successfully', recommendations);
});

/**
 * Get budget-based recommendations
 */
const getBudgetRecommendations = asyncHandler(async (req, res) => {
  const { budget } = req.query;
  const { limit = 10 } = req.query;

  if (!budget) {
    return ApiResponse.badRequest(res, 'Budget is required');
  }

  const designs = await recommendationService.getBudgetRecommendations(
    parseInt(budget),
    parseInt(limit)
  );

  ApiResponse.ok(res, 'Budget recommendations retrieved successfully', designs);
});

/**
 * Get style-based recommendations
 */
const getStyleRecommendations = asyncHandler(async (req, res) => {
  const { style } = req.params;
  const { limit = 10 } = req.query;

  if (!style) {
    return ApiResponse.badRequest(res, 'Style parameter is required');
  }

  const designs = await recommendationService.getStyleRecommendations(style, parseInt(limit));
  ApiResponse.ok(res, 'Style recommendations retrieved successfully', designs);
});

/**
 * Get personalized recommendations for authenticated user
 */
const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { limit = 10 } = req.query;

  if (!userId) {
    return ApiResponse.badRequest(res, 'Authentication required for personalized recommendations');
  }

  const recommendations = await recommendationService.getPersonalizedRecommendations(
    userId,
    parseInt(limit)
  );

  ApiResponse.ok(res, 'Personalized recommendations retrieved successfully', recommendations);
});

/**
 * Get engineer recommendations for user
 */
const getEngineerRecommendations = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { limit = 10 } = req.query;

  if (!userId) {
    return ApiResponse.badRequest(res, 'Authentication required for engineer recommendations');
  }

  const engineers = await recommendationService.getEngineerRecommendations(
    userId,
    parseInt(limit)
  );

  ApiResponse.ok(res, 'Engineer recommendations retrieved successfully', engineers);
});

/**
 * Get collaborative filtering recommendations
 */
const getCollaborativeDesigns = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { limit = 10 } = req.query;

  if (!userId) {
    return ApiResponse.badRequest(res, 'User ID is required');
  }

  const designs = await recommendationService.getCollaborativeDesigns(
    userId,
    parseInt(limit)
  );

  ApiResponse.ok(res, 'Collaborative recommendations retrieved successfully', designs);
});

/**
 * Refresh recommendations cache
 */
const refreshRecommendations = asyncHandler(async (req, res) => {
  const result = await recommendationService.refreshRecommendations();
  ApiResponse.ok(res, 'Recommendations refreshed successfully', result);
});

/**
 * Record user interaction for recommendations
 */
const recordInteraction = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { designId, interactionType } = req.body;

  if (!userId) {
    return ApiResponse.badRequest(res, 'Authentication required');
  }

  if (!designId || !interactionType) {
    return ApiResponse.badRequest(res, 'Design ID and interaction type are required');
  }

  await recommendationService.recordInteraction(userId, designId, interactionType);
  ApiResponse.ok(res, 'Interaction recorded successfully');
});

module.exports = {
  getHomeRecommendations,
  getTrendingDesigns,
  getPopularDesigns,
  getDesignRecommendations,
  getBudgetRecommendations,
  getStyleRecommendations,
  getPersonalizedRecommendations,
  getEngineerRecommendations,
  getCollaborativeDesigns,
  refreshRecommendations,
  recordInteraction,
};

