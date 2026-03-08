/**
 * BuildMyHome - Error Handling Middleware
 */

const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Express validator error formatter
 */
const formatExpressValidatorErrors = (errors) => {
  return errors.map((error) => ({
    field: error.path,
    message: error.msg,
  }));
};

/**
 * Handle Mongoose validation errors
 */
const handleMongooseValidationError = (error) => {
  const errors = Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
  }));
  return new ApiError(400, 'Validation Error', errors);
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleMongooseDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  return new ApiError(409, `${field} already exists`);
};

/**
 * Handle Mongoose cast errors (invalid ObjectId)
 */
const handleMongooseCastError = (error) => {
  return new ApiError(400, 'Invalid ID format');
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new ApiError(401, 'Invalid token. Please login again.');
};

/**
 * Handle JWT expired error
 */
const handleJWTExpiredError = () => {
  return new ApiError(401, 'Token expired. Please login again.');
};

/**
 * Not found handler - 404
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  } else if (err.code === 11000) {
    error = handleMongooseDuplicateKeyError(err);
  } else if (err.name === 'CastError') {
    error = handleMongooseCastError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // If it's already an ApiError, use its properties
  if (!(error instanceof ApiError)) {
    error = new ApiError(
      err.statusCode || 500,
      error.message || 'Internal Server Error',
      [],
      error.stack
    );
  }

  // Send error response
  const response = {
    success: false,
    error: {
      code: error.statusCode,
      message: error.message,
    },
  };

  // Add validation errors if any
  if (error.errors && error.errors.length > 0) {
    response.error.details = error.errors;
  }

  // Hide error details in production
  if (config.env === 'production' && !error.errors) {
    response.error.message = 'Something went wrong';
  }

  res.status(error.statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  errorHandler,
  formatExpressValidatorErrors,
};

