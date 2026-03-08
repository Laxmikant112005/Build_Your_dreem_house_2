/**
 * BuildMyHome - Admin Service
 * Business logic for admin operations
 */

const User = require('../user/user.model');
const Design = require('../design/design.model');
const Booking = require('../booking/booking.model');
const Review = require('../review/review.model');
const ApiError = require('../../utils/ApiError');
const { ROLE } = require('../../constants/roles');
const { DESIGN_STATUS } = require('../../constants/enums');

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalEngineers,
      totalDesigns,
      pendingDesigns,
      totalBookings,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments({ role: ROLE.USER }),
      User.countDocuments({ role: ROLE.ENGINEER, 'engineerProfile.isVerified': true }),
      Design.countDocuments({ status: DESIGN_STATUS.APPROVED }),
      Design.countDocuments({ status: DESIGN_STATUS.PENDING }),
      Booking.countDocuments(),
      Review.countDocuments({ status: 'approved' }),
    ]);

    // Get recent signups
    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending engineer applications
    const pendingEngineers = await User.find({
      role: ROLE.ENGINEER,
      'engineerProfile.verificationStatus': 'pending',
    })
      .select('firstName lastName email engineerProfile createdAt')
      .limit(5);

    return {
      stats: {
        totalUsers,
        totalEngineers,
        totalDesigns,
        pendingDesigns,
        totalBookings,
        totalReviews,
      },
      recentUsers,
      pendingEngineers,
    };
  }

  /**
   * Get all users with filtering and pagination
   */
  async getUsers(options = {}) {
    const { page = 1, limit = 20, role, search, isActive } = options;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all designs with filtering
   */
  async getDesigns(options = {}) {
    const { page = 1, limit = 20, status, engineerId, search } = options;

    const query = {};
    if (status) query.status = status;
    if (engineerId) query.engineerId = engineererId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [designs, total] = await Promise.all([
      Design.find(query)
        .populate('engineerId', 'firstName lastName email')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Design.countDocuments(query),
    ]);

    return {
      designs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve a design
   */
  async approveDesign(designId) {
    const design = await Design.findById(designId);
    
    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    design.status = DESIGN_STATUS.APPROVED;
    design.publishedAt = new Date();
    await design.save();

    return design;
  }

  /**
   * Reject a design
   */
  async rejectDesign(designId, reason) {
    const design = await Design.findById(designId);
    
    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    design.status = DESIGN_STATUS.REJECTED;
    design.rejectionReason = reason;
    await design.save();

    return design;
  }

  /**
   * Verify engineer profile
   */
  async verifyEngineer(engineerId, status, reason = null) {
    const engineer = await User.findOne({
      _id: engineerId,
      role: ROLE.ENGINEER,
    });

    if (!engineer) {
      throw new ApiError(404, 'Engineer not found');
    }

    engineer.engineerProfile.verificationStatus = status;
    engineer.engineerProfile.isVerified = status === 'approved';

    if (status === 'rejected' && reason) {
      engineer.engineerProfile.rejectionReason = reason;
    }

    await engineer.save();

    return engineer;
  }

  /**
   * Get all bookings with filtering
   */
  async getBookings(options = {}) {
    const { page = 1, limit = 20, status, engineerId, userId } = options;

    const query = {};
    if (status) query.status = status;
    if (engineerId) query.engineerId = engineererId;
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('engineerId', 'firstName lastName email')
        .populate('designId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(startDate, endDate) {
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const [userStats, engineerStats, designStats, bookingStats] = await Promise.all([
      // User growth
      User.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Engineer growth
      User.aggregate([
        { $match: { ...dateQuery, role: ROLE.ENGINEER } },
        {
          $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Design stats
      Design.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      // Booking revenue
      Booking.aggregate([
        { $match: { ...dateQuery, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.totalAmount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      userGrowth: userStats,
      engineerGrowth: engineerStats,
      designStats: designStats,
      bookingRevenue: bookingStats[0] || { totalRevenue: 0, count: 0 },
    };
  }

  /**
   * Update user role
   */
  async updateUserRole(userId, role) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent removing own admin role
    if (user._id.toString() === req.userId?.toString() && role !== ROLE.ADMIN) {
      throw new ApiError(400, 'Cannot remove your own admin role');
    }

    user.role = role;
    await user.save();

    return user;
  }

  /**
   * Deactivate/Activate user
   */
  async toggleUserStatus(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }
}

module.exports = new AdminService();

