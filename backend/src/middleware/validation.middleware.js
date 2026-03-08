/**
 * BuildMyHome - Validation Middleware
 * Request validation using express-validator
 */

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Validation middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return next(new ApiError(422, 'Validation failed', formattedErrors));
  }
  next();
};

module.exports = { validate };

