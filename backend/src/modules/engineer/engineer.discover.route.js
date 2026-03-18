/**
 * BuildMyHome - Engineer Discovery Routes
 */

const express = require('express');
const validate = require('../../middleware/validation.middleware');
const discoverController = require('./engineer.discover.controller');

const router = express.Router();

router.get('/discover', 
  validate([
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Min rating must be between 0 and 5'),
    query('maxPricePerSqft').optional().isFloat({ min: 0 }).withMessage('Max price per sqft must be positive'),
    query('designId').optional().isMongoId().withMessage('Invalid design ID'),
  ]),
  discoverController.discoverEngineers
);

module.exports = router;

