/**
 * BuildMyHome - User Service
 * Business logic for user operations
 */

const User = require('./user.model');
const ApiError = require('../../utils/ApiError');
const { cache } = require('../../config/redis');

class UserService {
  /**
   * Create a new user
   */
  async createUser(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }
    const user = await User.create(userData);
    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const cacheKey = `user:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    await cache.set(cacheKey, user, 300);
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Update user
   */
  async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    // Invalidate cache
    await cache.del(`user:${userId}`);
    return user;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId, preferences) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.preferences;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return true;
  }

  /**
   * Get all users with pagination
   */
  async getUsers(filters = {}, options = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    const query = { ...filters };
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update engineer profile
   */
  async updateEngineerProfile(userId, profileData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { engineerProfile: profileData } },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.engineerProfile;
  }

  /**
   * Apply to become engineer
   */
  async applyAsEngineer(userId, applicationData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    if (user.role === 'engineer') {
      throw new ApiError(400, 'You are already an engineer');
    }

    user.role = 'engineer';
    user.engineerProfile = {
      ...applicationData,
      verificationStatus: 'pending',
      isVerified: false,
      rating: { average: 0, count: 0 },
    };
    await user.save();
    return user;
  }

  /**
   * Get favorite designs
   */
  async getFavorites(userId, page = 1, limit = 20) {
    const user = await User.findById(userId)
      .populate({
        path: 'favorites',
        populate: { path: 'engineerId', select: 'firstName lastName avatar' },
      })
      .skip((page - 1) * limit)
      .limit(limit);

    return user?.favorites || [];
  }
}

module.exports = new UserService();

