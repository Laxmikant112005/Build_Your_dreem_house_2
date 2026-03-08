/**
 * BuildMyHome - API Response Class
 * Standardized API response format
 */

class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  /**
   * Send success response
   */
  static success(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta && { meta }),
    });
  }

  /**
   * 200 - OK
   */
  static ok(res, message = 'Success', data = null, meta = null) {
    return this.success(res, 200, message, data, meta);
  }

  /**
   * 201 - Created
   */
  static created(res, message = 'Created successfully', data = null) {
    return this.success(res, 201, message, data);
  }

  /**
   * 204 - No Content
   */
  static noContent(res, message = 'No Content') {
    return res.status(204).json({
      success: true,
      message,
    });
  }

  /**
   * Paginated response
   */
  static paginated(res, message = 'Success', data = [], pagination = {}) {
    return this.success(res, 200, message, data, {
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || 0,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false,
      },
    });
  }

  /**
   * Error response
   */
  static error(res, statusCode = 500, message = 'Internal Server Error', errors = []) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors.length > 0 && { errors }),
    });
  }

  /**
   * 400 - Bad Request
   */
  static badRequest(res, message = 'Bad Request', errors = []) {
    return this.error(res, 400, message, errors);
  }

  /**
   * 401 - Unauthorized
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, 401, message);
  }

  /**
   * 403 - Forbidden
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, 403, message);
  }

  /**
   * 404 - Not Found
   */
  static notFound(res, message = 'Not Found') {
    return this.error(res, 404, message);
  }

  /**
   * 422 - Validation Error
   */
  static validationError(res, message = 'Validation Error', errors = []) {
    return this.error(res, 422, message, errors);
  }

  /**
   * 429 - Too Many Requests
   */
  static tooManyRequests(res, message = 'Too Many Requests') {
    return this.error(res, 429, message);
  }

  /**
   * 500 - Internal Server Error
   */
  static internalError(res, message = 'Internal Server Error') {
    return this.error(res, 500, message);
  }
}

module.exports = ApiResponse;

