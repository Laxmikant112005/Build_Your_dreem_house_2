/**
 * BuildMyHome - Review Service
 * Business logic for review operations
 */

const Review = require('./review.model');
const User = require('../user/user.model');
const Booking = require('../booking/booking.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

class ReviewService {
  /**
   * Create a new review
   */
  async createReview(data) {
    const { userId, engineerId, bookingId, designId, rating, title, comment, images, pros, cons } = data;

    // Verify engineer exists
    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== 'engineer') {
      throw new ApiError(404, 'Engineer not found');
    }

    // Verify booking if provided
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new ApiError(404, 'Booking not found');
      }
      if (booking.userId.toString() !== userId) {
        throw new ApiError(403, 'You can only review your own bookings');
      }
      if (booking.status !== 'completed') {
        throw new ApiError(400, 'You can only review completed bookings');
      }
    }

    const review = new Review({
      userId,
      engineerId,
      bookingId,
      designId,
      rating,
      title,
      comment,
      images: images || [],
      pros: pros || [],
      cons: cons || [],
      isVerified: !!bookingId, // Mark as verified if from a completed booking
      status: bookingId ? 'approved' : 'pending', // Auto-approve if from verified booking
    });

    await review.save();
    return review;
  }

  /**
   * Check if user already reviewed engineer
   */
  async checkExistingReview(userId, engineerId) {
    return Review.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      engineerId: new mongoose.Types.ObjectId(engineerId),
    });
  }

  /**
   * Get reviews with filters and pagination
   */
  async getReviews(filters, options) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const { engineerId, designId, rating } = filters;

    const query = { status: 'approved' };

    if (engineerId) {
      query.engineerId = new mongoose.Types.ObjectId(engineerId);
    }

    if (designId) {
      query.designId = new mongoose.Types.ObjectId(designId);
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'firstName lastName avatar')
        .populate('engineerId', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId) {
    return Review.findById(reviewId)
      .populate('userId', 'firstName lastName avatar')
      .populate('engineerId', 'firstName lastName avatar engineerProfile')
      .populate('bookingId', 'bookingId')
      .populate('designId', 'title');
  }

  /**
   * Update a review
   */
  async updateReview(reviewId, userId, updateData) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Only author can update their review
    if (review.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'You can only update your own reviews');
    }

    // Can only update if not already approved
    if (review.status === 'approved') {
      throw new ApiError(400, 'Approved reviews cannot be updated');
    }

    const allowedUpdates = ['rating', 'title', 'comment', 'images', 'pros', 'cons'];
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        review[key] = updateData[key];
      }
    }

    await review.save();
    return review;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId, userId, userRole) {
    const review = await Review.findById(reviewId);

    if (!review) {
      return null;
    }

    // Only author or admin can delete
    if (userRole !== 'admin' && review.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'You can only delete your own reviews');
    }

    await review.deleteOne();
    return true;
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId, userId) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Check if user already marked as helpful
    if (review.helpfulBy.includes(userId)) {
      throw new ApiError(400, 'You have already marked this review as helpful');
    }

    review.helpfulBy.push(userId);
    review.isHelpful += 1;
    await review.save();

    return review;
  }

  /**
   * Respond to review (engineer only)
   */
  async respondToReview(reviewId, engineerId, message) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    // Only the engineer being reviewed can respond
    if (review.engineerId.toString() !== engineerId.toString()) {
      throw new ApiError(403, 'You can only respond to reviews about yourself');
    }

    review.response = {
      message,
      respondedAt: new Date(),
    };

    await review.save();
    return review;
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(userId, options) {
    const { page = 1, limit = 20 } = options;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ userId })
        .populate('engineerId', 'firstName lastName avatar engineerProfile.rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ userId }),
    ]);

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get reviews for a specific engineer
   */
  async getEngineerReviews(engineerId, options) {
    const { page = 1, limit = 20, rating } = options;

    const query = {
      engineerId: new mongoose.Types.ObjectId(engineerId),
      status: 'approved',
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(query),
    ]);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return {
      reviews,
      ratingDistribution,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get review statistics for an engineer
   */
  async getReviewStats(engineerId) {
    const stats = await Review.aggregate([
      {
        $match: {
          engineerId: new mongoose.Types.ObjectId(engineerId),
          status: 'approved',
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          totalHelpful: { $sum: '$isHelpful' },
        },
      },
    ]);

    const result = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
      totalHelpful: 0,
    };

    return {
      averageRating: Math.round(result.averageRating * 10) / 10,
      totalReviews: result.totalReviews,
      distribution: {
        5: result.fiveStar,
        4: result.fourStar,
        3: result.threeStar,
        2: result.twoStar,
        1: result.oneStar,
      },
      totalHelpful: result.totalHelpful,
    };
  }

  /**
   * Get all reviews (admin)
   */
  async getAllReviews(options) {
    const { page = 1, limit = 20, status } = options;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('engineerId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Moderate review (admin)
   */
  async moderateReview(reviewId, status, rejectionReason) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    review.status = status;

    if (status === 'rejected' && rejectionReason) {
      review.rejectionReason = rejectionReason;
    }

    await review.save();
    return review;
  }
}

module.exports = new ReviewService();

