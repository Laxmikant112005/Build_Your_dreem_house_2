/**
 * BuildMyHome - Auth Routes
 * API routes for authentication endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { body, param } = require('express-validator');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
  body('lastName').notEmpty().trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
  body('phone').optional().matches(/^[+]?[\\d\\s-]{10,}$/),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const otpValidation = [
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().matches(/^[+]?[\\d\\s-]{10,}$/),
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty(),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail(),
];

const resetPasswordValidation = [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
];

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/send-otp', authLimiter, otpValidation, validate, authController.sendOTP);
router.post('/verify-otp', authLimiter, [...otpValidation, body('otp').isLength({ min: 6, max: 6 }).isNumeric()], validate, authController.verifyOTP);
router.post('/refresh-token', refreshTokenValidation, validate, authController.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);
router.get('/verify-email/:token', param('token').notEmpty(), validate, authController.verifyEmail);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/change-password', authenticate, changePasswordValidation, validate, authController.changePassword);
router.post('/resend-verification', authenticate, authController.resendVerification);

module.exports = router;