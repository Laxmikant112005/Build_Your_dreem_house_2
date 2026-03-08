/**
 * BuildMyHome - API Error Class
 * Custom error handling class
 */

class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * 400 - Bad Request
   */
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * 401 - Unauthorized
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /**
   * 403 - Forbidden
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  /**
   * 404 - Not Found
   */
  static notFound(message = 'Not Found') {
    return new ApiError(404, message);
  }

  /**
   * 409 - Conflict
   */
  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  /**
   * 422 - Unprocessable Entity
   */
  static unprocessable(message = 'Unprocessable Entity', errors = []) {
    return new ApiError(422, message, errors);
  }

  /**
   * 429 - Too Many Requests
   */
  static tooManyRequests(message = 'Too Many Requests') {
    return new ApiError(429, message);
  }

  /**
   * 500 - Internal Server Error
   */
  static internal(message = 'Internal Server Error', stack = '') {
    return new ApiError(500, message, [], stack);
  }
}

module.exports = ApiError;

