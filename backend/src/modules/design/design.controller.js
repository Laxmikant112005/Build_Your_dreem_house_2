/**
 * BuildMyHome - Design Controller
 * Request handlers for design endpoints
 */

const designService = require('./design.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get all designs with filters
 */
const getDesigns = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, style, minCost, maxCost, minArea, maxArea, floors, city, sortBy, sortOrder } = req.query;

  const result = await designService.getDesigns({}, {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    style,
    minCost: minCost ? parseInt(minCost) : undefined,
    maxCost: maxCost ? parseInt(maxCost) : undefined,
    minArea: minArea ? parseInt(minArea) : undefined,
    maxArea: maxArea ? parseInt(maxArea) : undefined,
    floors: floors ? parseInt(floors) : undefined,
    city,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc',
  });

  ApiResponse.paginated(res, 'Designs retrieved successfully', result.designs, result.pagination);
});

/**
 * Get featured designs
 */
const getFeaturedDesigns = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const designs = await designService.getFeatured(parseInt(limit));
  ApiResponse.ok(res, 'Featured designs retrieved successfully', designs);
});

/**
 * Get trending designs
 */
const getTrendingDesigns = asyncHandler(async (req, res) => {
  const { days = 7, limit = 10 } = req.query;
  const designs = await designService.getTrending(parseInt(days), parseInt(limit));
  ApiResponse.ok(res, 'Trending designs retrieved successfully', designs);
});

/**
 * Get design by ID
 */
const getDesignById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const design = await designService.getDesignById(id, true);
  ApiResponse.ok(res, 'Design retrieved successfully', design);
});

/**
 * Get design by slug
 */
const getDesignBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const design = await designService.getDesignBySlug(slug);
  // Increment view count
  design.metrics.views += 1;
  await design.save();
  ApiResponse.ok(res, 'Design retrieved successfully', design);
});

/**
 * Create new design
 */
const createDesign = asyncHandler(async (req, res) => {
  const design = await designService.createDesign(req.userId, req.body);
  ApiResponse.created(res, 'Design created successfully', design);
});

/**
 * Update design
 */
const updateDesign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const design = await designService.updateDesign(id, req.userId, req.body);
  ApiResponse.ok(res, 'Design updated successfully', design);
});

/**
 * Delete design
 */
const deleteDesign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await designService.deleteDesign(id, req.userId);
  ApiResponse.ok(res, 'Design deleted successfully');
});

/**
 * Submit design for approval
 */
const submitForApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const design = await designService.submitForApproval(id, req.userId);
  ApiResponse.ok(res, 'Design submitted for approval', design);
});

/**
 * Like/unlike design
 */
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await designService.toggleLike(id, req.userId);
  ApiResponse.ok(res, result.liked ? 'Design liked' : 'Design unliked', result);
});

/**
 * Get related designs
 */
const getRelatedDesigns = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;
  const designs = await designService.getRelatedDesigns(id, parseInt(limit));
  ApiResponse.ok(res, 'Related designs retrieved successfully', designs);
});

/**
 * Get filter options
 */
const getFilterOptions = asyncHandler(async (req, res) => {
  const options = await designService.getFilterOptions();
  ApiResponse.ok(res, 'Filter options retrieved successfully', options);
});

/**
 * Get engineer's own designs
 */
const getMyDesigns = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const result = await designService.getEngineerDesigns(req.userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });
  ApiResponse.paginated(res, 'Your designs retrieved successfully', result.designs, result.pagination);
});

module.exports = {
  getDesigns,
  getFeaturedDesigns,
  getTrendingDesigns,
  getDesignById,
  getDesignBySlug,
  createDesign,
  updateDesign,
  deleteDesign,
  submitForApproval,
  toggleLike,
  getRelatedDesigns,
  getFilterOptions,
  getMyDesigns,
};

