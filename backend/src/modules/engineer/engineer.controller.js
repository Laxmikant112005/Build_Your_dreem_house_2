/**
 * BuildMyHome - Engineer Controller
 * Request handlers for engineer endpoints
 */

const engineerService = require('./engineer.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Get all engineers with filtering and pagination
 */
const getEngineers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    city,
    style,
    minRating,
    minExperience,
    sortBy = 'rating',
    sortOrder = 'desc',
  } = req.query;

  const filters = {
    city,
    style,
    minRating: minRating ? parseFloat(minRating) : undefined,
    minExperience: minExperience ? parseInt(minExperience) : undefined,
  };

  const result = await engineerService.getEngineers(filters, {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  });

  ApiResponse.ok(res, 'Engineers retrieved successfully', result);
});

/**
 * Get engineer by ID
 */
const getEngineerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const engineer = await engineerService.getEngineerById(id);
  
  if (!engineer) {
    return ApiResponse.notFound(res, 'Engineer not found');
  }

  ApiResponse.ok(res, 'Engineer retrieved successfully', engineer);
});

/**
 * Get featured engineers
 */
const getFeaturedEngineers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const engineers = await engineerService.getFeaturedEngineers(parseInt(limit));
  ApiResponse.ok(res, 'Featured engineers retrieved successfully', engineers);
});

/**
 * Get designs by engineer
 */
const getEngineerDesigns = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, status = 'approved' } = req.query;

  const result = await engineerService.getEngineerDesigns(id, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });

  ApiResponse.ok(res, 'Engineer designs retrieved successfully', result);
});

/**
 * Get reviews for engineer
 */
const getEngineerReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const result = await engineerService.getEngineerReviews(id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  ApiResponse.ok(res, 'Engineer reviews retrieved successfully', result);
});

/**
 * Update engineer profile
 */
const updateEngineerProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const updateData = req.body;

  const engineer = await engineerService.updateProfile(userId, updateData);
  ApiResponse.ok(res, 'Profile updated successfully', engineer);
});

/**
 * Update engineer availability
 */
const updateAvailability = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { availability } = req.body;

  const engineer = await engineerService.updateAvailability(userId, availability);
  ApiResponse.ok(res, 'Availability updated successfully', engineer);
});

/**
 * Add portfolio item
 */
const addPortfolioItem = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const portfolioItem = req.body;

  const engineer = await engineerService.addPortfolioItem(userId, portfolioItem);
  ApiResponse.created(res, 'Portfolio item added successfully', engineer);
});

/**
 * Remove portfolio item
 */
const removePortfolioItem = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { portfolioId } = req.params;

  const engineer = await engineerService.removePortfolioItem(userId, portfolioId);
  ApiResponse.ok(res, 'Portfolio item removed successfully', engineer);
});

/**
 * Get engineer statistics
 */
const getEngineerStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stats = await engineerService.getEngineerStats(id);
  ApiResponse.ok(res, 'Engineer statistics retrieved successfully', stats);
});

/**
 * Search engineers by name or specialization
 */
const searchEngineers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.length < 2) {
    return ApiResponse.badRequest(res, 'Search query must be at least 2 characters');
  }

  const result = await engineerService.searchEngineers(q, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  ApiResponse.ok(res, 'Search results retrieved successfully', result);
});

module.exports = {
  getEngineers,
  getEngineerById,
  getFeaturedEngineers,
  getEngineerDesigns,
  getEngineerReviews,
  updateEngineerProfile,
  updateAvailability,
  addPortfolioItem,
  removePortfolioItem,
  getEngineerStats,
  searchEngineers,
};

