/**
 * BuildMyHome - Review Controller
 * Request handlers for review endpoints
 */

const reviewService = require('./review.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Create a new review
 */
const createReview = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { engineerId, bookingId, designId, rating, title, comment, images, pros, cons } = req.body;

  // Check if user already reviewed this engineer
  const existingReview = await reviewService.checkExistingReview(userId, engineerId);
  if (existingReview) {
    return ApiResponse.badRequest(res, 'You have already reviewed this engineer');
  }

  const review = await reviewService.createReview({
    userId,
    engineerId,
    bookingId,
    designId,
    rating,
    title,
    comment,
    images,
    pros,
    cons,
  });

  ApiResponse.created(res, 'Review submitted successfully', review);
});

/**
 * Get all reviews with filtering
 */
const getReviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    engineerId,
    designId,
    rating,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filters = {
    engineerId,
    designId,
    rating: rating ? parseInt(rating) : undefined,
  };

  const result = await reviewService.getReviews(filters, {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  });

  ApiResponse.ok(res, 'Reviews retrieved successfully', result);
});

/**
 * Get review by ID
 */
const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await reviewService.getReviewById(id);

  if (!review) {
    return ApiResponse.notFound(res, 'Review not found');
  }

  ApiResponse.ok(res, 'Review retrieved successfully', review);
});

/**
 * Update a review
 */
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const updateData = req.body;

  const review = await reviewService.updateReview(id, userId, updateData);

  if (!review) {
    return ApiResponse.notFound(res, 'Review not found or unauthorized');
  }

  ApiResponse.ok(res, 'Review updated successfully', review);
});

/**
 * Delete a review
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const userRole = req.user?.role;

  const result = await reviewService.deleteReview(id, userId, userRole);

  if (!result) {
    return ApiResponse.notFound(res, 'Review not found or unauthorized');
  }

  ApiResponse.ok(res, 'Review deleted successfully');
});

/**
 * Mark review as helpful
 */
const markHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const review = await reviewService.markHelpful(id, userId);

  if (!review) {
    return ApiResponse.notFound(res, 'Review not found');
  }

  ApiResponse.ok(res, 'Review marked as helpful', { helpfulCount: review.isHelpful });
});

/**
 * Add response to review (engineer only)
 */
const respondToReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const engineerId = req.userId;
  const { message } = req.body;

  const review = await reviewService.respondToReview(id, engineerId, message);

  if (!review) {
    return ApiResponse.notFound(res, 'Review not found or unauthorized');
  }

  ApiResponse.ok(res, 'Response added successfully', review);
});

/**
 * Get my reviews
 */
const getMyReviews = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 20 } = req.query;

  const result = await reviewService.getUserReviews(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  ApiResponse.ok(res, 'My reviews retrieved successfully', result);
});

/**
 * Get reviews for a specific engineer
 */
const getEngineerReviews = asyncHandler(async (req, res) => {
  const { engineerId } = req.params;
  const { page = 1, limit = 20, rating } = req.query;

  const result = await reviewService.getEngineerReviews(engineerId, {
    page: parseInt(page),
    limit: parseInt(limit),
    rating: rating ? parseInt(rating) : undefined,
  });

  ApiResponse.ok(res, 'Engineer reviews retrieved successfully', result);
});

/**
 * Get review statistics for an engineer
 */
const getReviewStats = asyncHandler(async (req, res) => {
  const { engineerId } = req.params;

  const stats = await reviewService.getReviewStats(engineerId);
  ApiResponse.ok(res, 'Review statistics retrieved successfully', stats);
});

/**
 * Admin: Get all reviews (including pending)
 */
const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const result = await reviewService.getAllReviews({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });

  ApiResponse.ok(res, 'All reviews retrieved successfully', result);
});

/**
 * Admin: Approve/reject review
 */
const moderateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  const review = await reviewService.moderateReview(id, status, rejectionReason);

  if (!review) {
    return ApiResponse.notFound(res, 'Review not found');
  }

  ApiResponse.ok(res, 'Review moderated successfully', review);
});

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  markHelpful,
  respondToReview,
  getMyReviews,
  getEngineerReviews,
  getReviewStats,
  getAllReviews,
  moderateReview,
};

