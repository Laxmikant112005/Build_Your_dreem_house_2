/**
 * BuildMyHome - User Controller
 * Request handlers for user endpoints
 */

const userService = require('./user.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Get current user profile
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.userId);
  ApiResponse.ok(res, 'Profile retrieved successfully', user);
});

/**
 * Update current user profile
 */
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'avatar'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const user = await userService.updateUser(req.userId, updateData);
  ApiResponse.ok(res, 'Profile updated successfully', user);
});

/**
 * Get user by ID (public profile)
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  // Return limited public information
  const publicProfile = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    role: user.role,
    engineerProfile: user.role === 'engineer' ? {
      isVerified: user.engineerProfile?.isVerified,
      specializations: user.engineerProfile?.specializations,
      experience: user.engineerProfile?.experience,
      rating: user.engineerProfile?.rating,
    } : undefined,
    createdAt: user.createdAt,
  };
  ApiResponse.ok(res, 'User retrieved successfully', publicProfile);
});

/**
 * Update user preferences
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await userService.updatePreferences(req.userId, req.body.preferences);
  ApiResponse.ok(res, 'Preferences updated successfully', preferences);
});

/**
 * Get user preferences
 */
const getPreferences = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.userId);
  ApiResponse.ok(res, 'Preferences retrieved successfully', user.preferences);
});

/**
 * Get user bookings
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filters = { userId: req.userId };
  if (status) filters.status = status;

  // This would call booking service
  // const result = await bookingService.getBookings(filters, { page, limit });
  ApiResponse.ok(res, 'Bookings retrieved successfully', [], {
    pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, totalPages: 0 }
  });
});

/**
 * Get user favorites
 */
const getMyFavorites = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const favorites = await userService.getFavorites(req.userId, parseInt(page), parseInt(limit));
  ApiResponse.ok(res, 'Favorites retrieved successfully', favorites);
});

/**
 * Apply to become engineer
 */
const applyAsEngineer = asyncHandler(async (req, res) => {
  const requiredFields = ['licenseNumber', 'specializations', 'experience', 'serviceAreas'];
  const missing = requiredFields.filter(field => !req.body[field]);
  
  if (missing.length > 0) {
    return ApiResponse.badRequest(res, `Missing required fields: ${missing.join(', ')}`);
  }

  const user = await userService.applyAsEngineer(req.userId, req.body);
  ApiResponse.ok(res, 'Application submitted successfully', user);
});

/**
 * Get all users (admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, isActive, search } = req.query;
  
  const filters = {};
  if (role) filters.role = role;
  if (isActive !== undefined) filters.isActive = isActive === 'true';
  if (search) {
    filters.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const result = await userService.getUsers(filters, { page: parseInt(page), limit: parseInt(limit) });
  ApiResponse.paginated(res, 'Users retrieved successfully', result.users, result.pagination);
});

/**
 * Update user by admin
 */
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  ApiResponse.ok(res, 'User updated successfully', user);
});

/**
 * Delete user by admin
 */
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  ApiResponse.ok(res, 'User deleted successfully');
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUserById,
  updatePreferences,
  getPreferences,
  getMyBookings,
  getMyFavorites,
  applyAsEngineer,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
};

