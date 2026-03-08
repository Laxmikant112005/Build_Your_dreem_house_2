/**
 * BuildMyHome - Engineer Service
 * Business logic for engineer operations
 */

const User = require('../user/user.model');
const Design = require('../design/design.model');
const Review = require('../review/review.model');
const Booking = require('../booking/booking.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const { ROLE } = require('../../constants/roles');
const { DESIGN_STATUS } = require('../../constants/enums');

class EngineerService {
  /**
   * Get all engineers with filtering and pagination
   */
  async getEngineers(filters, options) {
    const { page = 1, limit = 20, sortBy = 'rating', sortOrder = 'desc' } = options;
    const { city, style, minRating, minExperience } = filters;

    // Build query
    const query = {
      role: ROLE.ENGINEER,
      isActive: true,
      'engineerProfile.isVerified': true,
    };

    // Add filters
    if (city) {
      query['engineerProfile.serviceAreas'] = {
        $elemMatch: { location: { $regex: city, $options: 'i' } }
      };
    }

    if (minRating) {
      query['engineerProfile.rating.average'] = { $gte: parseFloat(minRating) };
    }

    if (minExperience) {
      query['engineerProfile.experience'] = { $gte: parseInt(minExperience) };
    }

    // Build sort
    const sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions['engineerProfile.rating.average'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'experience':
        sortOptions['engineerProfile.experience'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'name':
        sortOptions.firstName = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'createdAt':
        sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sortOptions['engineerProfile.rating.average'] = -1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [engineers, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName avatar phone engineerProfile createdAt')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    return {
      engineers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get engineer by ID with full profile
   */
  async getEngineerById(engineerId) {
    const engineer = await User.findOne({
      _id: engineerId,
      role: ROLE.ENGINEER,
      isActive: true,
    }).select('-password -refreshToken');

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    // Get additional stats
    const [totalDesigns, totalBookings, completedBookings] = await Promise.all([
      Design.countDocuments({ engineerId, status: DESIGN_STATUS.APPROVED }),
      Booking.countDocuments({ engineerId }),
      Booking.countDocuments({ engineerId, status: 'completed' }),
    ]);

    return {
      ...engineer.toObject(),
      stats: {
        totalDesigns,
        totalBookings,
        completedBookings,
      },
    };
  }

  /**
   * Get featured engineers (highest rated)
   */
  async getFeaturedEngineers(limit = 10) {
    const engineers = await User.find({
      role: ROLE.ENGINEER,
      isActive: true,
      'engineerProfile.isVerified': true,
      'engineerProfile.rating.average': { $gte: 4.0 },
    })
      .select('firstName lastName avatar engineerProfile')
      .sort({ 'engineerProfile.rating.average': -1, 'engineerProfile.rating.count': -1 })
      .limit(parseInt(limit));

    return engineers;
  }

  /**
   * Get designs by engineer
   */
  async getEngineerDesigns(engineerId, options) {
    const { page = 1, limit = 20, status = 'approved' } = options;

    const query = {
      engineerId,
      status: status === 'all' ? { $in: Object.values(DESIGN_STATUS) } : status,
    };

    const skip = (page - 1) * limit;

    const [designs, total] = await Promise.all([
      Design.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Design.countDocuments(query),
    ]);

    return {
      designs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get reviews for engineer
   */
  async getEngineerReviews(engineerId, options) {
    const { page = 1, limit = 20 } = options;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ engineerId })
        .populate('userId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ engineerId }),
    ]);

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { engineerId: require('mongoose').Types.ObjectId.createFromHexString(engineerId) } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      reviews,
      rating: ratingStats[0] || { average: 0, count: 0 },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update engineer profile
   */
  async updateProfile(userId, updateData) {
    const allowedUpdates = [
      'firstName',
      'lastName',
      'phone',
      'avatar',
      'engineerProfile',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        if (key === 'engineerProfile') {
          // Handle nested engineer profile updates
          const profileFields = [
            'licenseNumber',
            'specializations',
            'experience',
            'serviceAreas',
            'bio',
          ];
          for (const field of profileFields) {
            if (updateData.engineerProfile[field] !== undefined) {
              updates[`engineerProfile.${field}`] = updateData.engineerProfile[field];
            }
          }
        } else {
          updates[key] = updateData[key];
        }
      }
    }

    const engineer = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    return engineer;
  }

  /**
   * Update engineer availability
   */
  async updateAvailability(userId, availability) {
    // Validate availability format
    if (!Array.isArray(availability)) {
      throw new ApiError(400, 'Availability must be an array');
    }

    for (const slot of availability) {
      if (slot.dayOfWeek === undefined || !slot.startTime || !slot.endTime) {
        throw new ApiError(400, 'Each availability slot must have dayOfWeek, startTime, and endTime');
      }
      if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        throw new ApiError(400, 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)');
      }
    }

    const engineer = await User.findByIdAndUpdate(
      userId,
      { $set: { 'engineerProfile.availability': availability } },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    return engineer;
  }

  /**
   * Add portfolio item
   */
  async addPortfolioItem(userId, portfolioItem) {
    const { title, description, images, completedDate } = portfolioItem;

    if (!title) {
      throw new ApiError(400, 'Portfolio title is required');
    }

    const newPortfolioItem = {
      title,
      description,
      images: images || [],
      completedDate: completedDate ? new Date(completedDate) : null,
    };

    const engineer = await User.findByIdAndUpdate(
      userId,
      { $push: { 'engineerProfile.portfolio': newPortfolioItem } },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    // Return the newly added portfolio item
    const portfolio = engineer.engineerProfile.portfolio;
    return portfolio[portfolio.length - 1];
  }

  /**
   * Remove portfolio item
   */
  async removePortfolioItem(userId, portfolioId) {
    const engineer = await User.findOneAndUpdate(
      {
        _id: userId,
        role: ROLE.ENGINEER,
        'engineerProfile.portfolio._id': portfolioId,
      },
      {
        $pull: { 'engineerProfile.portfolio': { _id: portfolioId } },
      },
      { new: true }
    ).select('-password -refreshToken');

    if (!engineer) {
      throw new ApiError(404, 'Portfolio item not found');
    }

    return engineer;
  }

  /**
   * Get engineer statistics
   */
  async getEngineerStats(engineerId) {
    const [
      totalDesigns,
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      totalReviews,
    ] = await Promise.all([
      Design.countDocuments({ engineerId, status: DESIGN_STATUS.APPROVED }),
      Booking.countDocuments({ engineerId }),
      Booking.countDocuments({ engineerId, status: 'completed' }),
      Booking.countDocuments({ engineerId, status: 'cancelled' }),
      Booking.countDocuments({ engineerId, status: 'pending' }),
      Review.countDocuments({ engineerId }),
    ]);

    // Get rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { engineerId: require('mongoose').Types.ObjectId.createFromHexString(engineerId) } },
      {
        $bucket: {
          groupBy: '$rating',
          boundaries: [1, 2, 3, 4, 5, 6],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    // Get monthly bookings for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      {
        $match: {
          engineerId: require('mongoose').Types.ObjectId.createFromHexString(engineerId),
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      designs: {
        total: totalDesigns,
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        pending: pendingBookings,
        completionRate: totalBookings > 0 
          ? ((completedBookings / totalBookings) * 100).toFixed(2) 
          : 0,
      },
      reviews: {
        total: totalReviews,
        breakdown: ratingBreakdown,
      },
      monthlyBookings,
    };
  }

  /**
   * Search engineers by name or specialization
   */
  async searchEngineers(searchQuery, options) {
    const { page = 1, limit = 20 } = options;

    const query = {
      role: ROLE.ENGINEER,
      isActive: true,
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { 'engineerProfile.specializations': { $regex: searchQuery, $options: 'i' } },
      ],
    };

    const skip = (page - 1) * limit;

    const [engineers, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName avatar engineerProfile')
        .sort({ 'engineerProfile.rating.average': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    return {
      engineers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new EngineerService();

