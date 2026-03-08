/**
 * BuildMyHome - Review Routes
 * API routes for review endpoints
 */

const express = require('express');
const router = express.Router();

const reviewController = require('./review.controller');
const { authenticate, authorize, optionalAuth } = require('../../middleware/auth.middleware');
const { ROLE } = require('../../constants/roles');

// Public routes
router.get('/', optionalAuth, reviewController.getReviews);
router.get('/stats/:engineerId', reviewController.getReviewStats);
router.get('/engineer/:engineerId', reviewController.getEngineerReviews);
router.get('/:id', optionalAuth, reviewController.getReviewById);

// Protected routes (authentication required)
router.post('/', authenticate, reviewController.createReview);
router.get('/my/reviews', authenticate, reviewController.getMyReviews);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);
router.post('/:id/helpful', authenticate, reviewController.markHelpful);

// Engineer response to review
router.post('/:id/respond', authenticate, reviewController.respondToReview);

// Admin routes
router.get('/admin/all', authenticate, authorize(ROLE.ADMIN), reviewController.getAllReviews);
router.put('/admin/:id/moderate', authenticate, authorize(ROLE.ADMIN), reviewController.moderateReview);

module.exports = router;

