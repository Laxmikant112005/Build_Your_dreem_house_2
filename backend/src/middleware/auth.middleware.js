/**
 * BuildMyHome - Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../modules/user/user.model');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Verify JWT token
 */
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }
    
    return { user, decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }
    throw new ApiError(401, 'Invalid token');
  }
};

/**
 * Authentication middleware - requires valid token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const { user } = await verifyToken(token);
    
    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      logger.error('Authentication error:', error.message);
      next(new ApiError(401, 'Authentication failed'));
    }
  }
};

/**
 * Optional authentication - attaches user if token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { user } = await verifyToken(token);
      req.user = user;
      req.userId = user._id;
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

/**
 * Role-based authorization
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access denied. Insufficient permissions.'));
    }

    next();
  };
};

/**
 * Check if user is verified engineer
 */
const requireVerifiedEngineer = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (req.user.role !== 'engineer') {
      throw new ApiError(403, 'Access denied. Engineer role required.');
    }

    if (!req.user.engineerProfile?.isVerified) {
      throw new ApiError(403, 'Your engineer profile is not verified yet.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user owns resource or is admin
 */
const checkOwnership = (getOwnerIdFromReq) => {
  return (req, res, next) => {
    const ownerId = getOwnerIdFromReq(req);
    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;

    // Allow if user is admin
    if (userRole === 'admin') {
      return next();
    }

    // Allow if user owns the resource
    if (ownerId && userId && ownerId.toString() === userId) {
      return next();
    }

    next(new ApiError(403, 'Access denied. You can only modify your own resources.'));
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requireVerifiedEngineer,
  checkOwnership,
  verifyToken,
};

