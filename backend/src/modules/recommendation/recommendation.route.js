/**
 * BuildMyHome - Recommendation Routes
 * API routes for recommendation endpoints
 */

const express = require('express');
const router = express.Router();

const recommendationController = require('./recommendation.controller');
const { authenticate, optionalAuth } = require('../../middleware/auth.middleware');

// Public routes
router.get('/home', recommendationController.getHomeRecommendations);
router.get('/trending', recommendationController.getTrendingDesigns);
router.get('/popular', recommendationController.getPopularDesigns);
router.get('/designs/:designId', recommendationController.getDesignRecommendations);
router.get('/budget', recommendationController.getBudgetRecommendations);
router.get('/style/:style', recommendationController.getStyleRecommendations);

// Protected routes (personalized)
router.get('/personalized', authenticate, recommendationController.getPersonalizedRecommendations);
router.get('/engineers', authenticate, recommendationController.getEngineerRecommendations);
router.get('/collaborative', authenticate, recommendationController.getCollaborativeDesigns);
router.post('/refresh', authenticate, recommendationController.refreshRecommendations);
router.post('/interact', authenticate, recommendationController.recordInteraction);

module.exports = router;

