/**
 * BuildMyHome - Admin Controller
 * Request handlers for admin endpoints
 */

const adminService = require('./admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get dashboard statistics
 */
const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  ApiResponse.ok(res, 'Dashboard data retrieved successfully', stats);
});

/**
 * Get all users (admin)
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, isActive } = req.query;

  const result = await adminService.getUsers({
    page: parseInt(page),
    limit: parseInt(limit),
    role,
    search,
    isActive,
  });

  ApiResponse.ok(res, 'Users retrieved successfully', result);
});

/**
 * Get all designs (admin)
 */
const getDesigns = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, engineerId, search } = req.query;

  const result = await adminService.getDesigns({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    engineerId,
    search,
  });

  ApiResponse.ok(res, 'Designs retrieved successfully', result);
});

/**
 * Approve design
 */
const approveDesign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const design = await adminService.approveDesign(id);
  ApiResponse.ok(res, 'Design approved successfully', design);
});

/**
 * Reject design
 */
const rejectDesign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return ApiResponse.badRequest(res, 'Rejection reason is required');
  }

  const design = await adminService.rejectDesign(id, reason);
  ApiResponse.ok(res, 'Design rejected successfully', design);
});

/**
 * Verify engineer
 */
const verifyEngineer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return ApiResponse.badRequest(res, 'Valid status (approved/rejected) is required');
  }

  const engineer = await adminService.verifyEngineer(id, status, reason);
  ApiResponse.ok(res, `Engineer ${status} successfully`, engineer);
});

/**
 * Get all bookings (admin)
 */
const getBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, engineerId, userId } = req.query;

  const result = await adminService.getBookings({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    engineerId,
    userId,
  });

  ApiResponse.ok(res, 'Bookings retrieved successfully', result);
});

/**
 * Get platform statistics
 */
const getPlatformStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const stats = await adminService.getPlatformStats(startDate, endDate);
  ApiResponse.ok(res, 'Platform statistics retrieved successfully', stats);
});

/**
 * Update user role
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return ApiResponse.badRequest(res, 'Role is required');
  }

  const user = await adminService.updateUserRole(id, role);
  ApiResponse.ok(res, 'User role updated successfully', user);
});

/**
 * Toggle user status (activate/deactivate)
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await adminService.toggleUserStatus(id);
  ApiResponse.ok(res, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user);
});

module.exports = {
  getDashboard,
  getUsers,
  getDesigns,
  approveDesign,
  rejectDesign,
  verifyEngineer,
  getBookings,
  getPlatformStats,
  updateUserRole,
  toggleUserStatus,
};

