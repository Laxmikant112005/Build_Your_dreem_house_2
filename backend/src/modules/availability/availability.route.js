/**
 * BuildMyHome - Availability Routes
 */

const express = require('express');
const authenticate = require('../../middleware/auth.middleware').authenticate;
const requireVerifiedEngineer = require('../../middleware/auth.middleware').requireVerifiedEngineer;
const availabilityController = require('./availability.controller');

const router = express.Router();

// Engineer routes
router.post('/', 
  authenticate,
  requireVerifiedEngineer,
  availabilityController.createSlot
);

// Public/User routes
router.get('/engineer/:engineerId/slots', availabilityController.findSlots);
router.get('/engineer', availabilityController.getAvailability);

module.exports = router;

