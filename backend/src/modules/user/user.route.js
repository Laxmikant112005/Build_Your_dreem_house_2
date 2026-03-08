/**
 * BuildMyHome - User Routes
 * API routes for user endpoints
 */

const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { body, param, query } = require('express-validator');

// Validation rules
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('phone').optional().trim().matches(/^[+]?[\d\s-]{10,}$/),
  body('avatar').optional().isURL(),
];

const preferencesValidation = [
  body('budgetMin').optional().isNumeric().custom(val => val >= 0),
  body('budgetMax').optional().isNumeric().custom(val => val >= 0),
  body('preferredStyles').optional().isArray(),
  body('preferredLocations').optional().isArray(),
  body('landSize').optional().isNumeric(),
  body('desiredRooms').optional().isInt({ min: 0 }),
];

const engineerApplicationValidation = [
  body('licenseNumber').notEmpty().trim(),
  body('specializations').isArray({ min: 1 }),
  body('experience').isInt({ min: 0 }),
  body('serviceAreas').isArray({ min: 1 }),
  body('serviceAreas.*.location').notEmpty(),
  body('serviceAreas.*.radiusKm').isInt({ min: 1 }),
];

// Public routes
router.get('/:id', 
  param('id').isMongoId(),
  validate,
  userController.getUserById
);

// Protected routes - User
router.get('/profile/me', authenticate, userController.getMyProfile);
router.put('/profile/me', authenticate, updateProfileValidation, validate, userController.updateMyProfile);
router.get('/preferences/me', authenticate, userController.getPreferences);
router.put('/preferences/me', authenticate, preferencesValidation, validate, userController.updatePreferences);
router.get('/bookings/me', authenticate, userController.getMyBookings);
router.get('/favorites/me', authenticate, userController.getMyFavorites);
router.post('/apply-engineer', authenticate, engineerApplicationValidation, validate, userController.applyAsEngineer);

// Protected routes - Admin
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.put('/:id', authenticate, authorize('admin'), param('id').isMongoId(), validate, userController.updateUserByAdmin);
router.delete('/:id', authenticate, authorize('admin'), param('id').isMongoId(), validate, userController.deleteUserByAdmin);

module.exports = router;

