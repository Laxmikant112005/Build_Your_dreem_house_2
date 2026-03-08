/**
 * BuildMyHome - Admin Routes
 */

const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { body, param, query } = require('express-validator');
const { ROLE } = require('../../constants/roles');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize(ROLE.ADMIN));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', param('id').isMongoId(), body('role').isIn(['user', 'engineer', 'admin']), validate, adminController.updateUserRole);
router.put('/users/:id/status', param('id').isMongoId(), validate, adminController.toggleUserStatus);

// Design management
router.get('/designs', adminController.getDesigns);
router.put('/designs/:id/approve', param('id').isMongoId(), validate, adminController.approveDesign);
router.put('/designs/:id/reject', param('id').isMongoId(), body('reason').notEmpty(), validate, adminController.rejectDesign);

// Engineer management
router.put('/engineers/:id/verify', param('id').isMongoId(), body('status').isIn(['approved', 'rejected']), validate, adminController.verifyEngineer);

// Booking management
router.get('/bookings', adminController.getBookings);

// Statistics
router.get('/stats', adminController.getPlatformStats);

module.exports = router;

