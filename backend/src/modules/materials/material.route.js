/**
 * BuildMyHome - Material Routes
 * API routes for materials marketplace
 */

const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validation.middleware');
const authenticate = require('../../middleware/auth.middleware').authenticate;
const materialController = require('./material.controller');
const materialValidator = {
  // Add validators later
};

const router = express.Router();

// Public routes
router.get('/', asyncHandler(materialController.getMaterials));
router.get('/:id', asyncHandler(materialController.getMaterial));

// Protected routes
router.post('/', 
  authenticate,
  validate(materialValidator.createMaterial),
  asyncHandler(materialController.createMaterial)
);

router.put('/:id', 
  authenticate,
  validate(materialValidator.updateMaterial),
  asyncHandler(materialController.updateMaterial)
);

router.delete('/:id', 
  authenticate,
  asyncHandler(materialController.deleteMaterial)
);

module.exports = router;

