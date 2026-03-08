/**
 * BuildMyHome - Auth Controller
 * Request handlers for authentication endpoints
 */

const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Register new user
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;
  
  const result = await authService.register({
    email,
    password,
    firstName,
    lastName,
    phone,
  });

  ApiResponse.created(res, 'Registration successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const result = await authService.login(email, password);

  ApiResponse.ok(res, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

/**
 * Logout user
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.userId);
  ApiResponse.ok(res, 'Logout successful');
});

/**
 * Refresh access token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return ApiResponse.badRequest(res, 'Refresh token is required');
  }

  const tokens = await authService.refreshToken(refreshToken);
  
  ApiResponse.ok(res, 'Token refreshed successfully', tokens);
});

/**
 * Forgot password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const result = await authService.generatePasswordResetToken(email);
  
  // In production, send email here
  ApiResponse.ok(res, 'Password reset email sent if email exists');
});

/**
 * Reset password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  await authService.resetPassword(token, password);
  
  ApiResponse.ok(res, 'Password reset successful');
});

/**
 * Change password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  await authService.changePassword(req.userId, currentPassword, newPassword);
  
  ApiResponse.ok(res, 'Password changed successfully');
});

/**
 * Get current user
 */
const getMe = asyncHandler(async (req, res) => {
  ApiResponse.ok(res, 'User retrieved successfully', req.user);
});

/**
 * Verify email
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  await authService.verifyEmail(token);
  
  ApiResponse.ok(res, 'Email verified successfully');
});

/**
 * Resend verification email
 */
const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerificationEmail(req.userId);
  
  // In production, send email here
  ApiResponse.ok(res, 'Verification email sent');
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  verifyEmail,
  resendVerification,
};

