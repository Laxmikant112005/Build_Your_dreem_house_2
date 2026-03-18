/**
 * BuildMyHome - Engineer Routes
 * API routes for engineer endpoints
 */

const express = require('express');
const router = express.Router();

const engineerController = require('./engineer.controller');
const { authenticate, authorize, optionalAuth } = require('../../middleware/auth.middleware');
const { ROLE } = require('../../constants/roles');

// Public routes (no authentication required)
router.get('/', engineerController.getEngineers);
router.get('/search', engineerController.searchEngineers);
router.get('/earnings/:id', engineerController.getEngineerEarnings);
router.get('/:id', optionalAuth, engineerController.getEngineerById);
router.get('/:id/designs', engineerController.getEngineerDesigns);
router.get('/:id/reviews', engineerController.getEngineerReviews);
router.get('/:id/stats', engineerController.getEngineerStats);

// Protected routes (authentication required)
// Engineer can update their own profile
router.put('/profile', authenticate, engineerController.updateEngineerProfile);
router.put('/availability', authenticate, engineerController.updateAvailability);

// Portfolio management
router.post('/portfolio', authenticate, engineerController.addPortfolioItem);
router.delete('/portfolio/:portfolioId', authenticate, engineerController.removePortfolioItem);

router.use('/discover', require('./engineer.discover.route'));

module.exports = router;

