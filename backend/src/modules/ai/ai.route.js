/**
 * BuildMyHome - AI Routes
 */

const express = require('express');
const validate = require('../../middleware/validation.middleware');
const authenticate = require('../../middleware/auth.middleware').authenticate;
const aiController = require('./ai.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/design-suggest', 
  validate({
    body: Joi.object({
      budget: Joi.number().min(0).required(),
      area: Joi.number().min(0).required(),
      location: Joi.string().optional(),
      preferences: Joi.string().optional(),
    }),
  }),
  aiController.designSuggest
);

router.post('/cost-estimate', 
  validate({
    body: Joi.object({
      area: Joi.number().min(0).required(),
      location: Joi.string().default('India'),
      materials: Joi.string().optional(),
      floors: Joi.number().min(1).default(1),
    }),
  }),
  aiController.costEstimate
);

router.post('/material-recommend', 
  validate({
    body: Joi.object({
      budget: Joi.number().min(0).required(),
      type: Joi.string().required(),
      location: Joi.string().optional(),
      quantity: Joi.number().default(1),
    }),
  }),
  aiController.materialRecommend
);

module.exports = router;

