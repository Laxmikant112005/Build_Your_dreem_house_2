/**
 * BuildMyHome - Auth Service
 * Authentication and authorization logic
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../user/user.model');
const ApiError = require('../../utils/ApiError');
const config = require('../../config');
const logger = require('../../utils/logger');

class AuthService {
  /**
   * Generate JWT tokens
   */
  generateTokens(userId) {
    const accessToken = jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Register new user
   */
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    const user = await User.create(userData);
    const tokens = this.generateTokens(user._id);
    
    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated. Please contact support.');
    }

    const tokens = this.generateTokens(user._id);
    
    // Save refresh token and update last login
    user.refreshToken = tokens.refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      ...tokens,
    };
  }

  /**
   * Logout user
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { $set: { refreshToken: null } });
    return true;
  }

  /**
   * Refresh access token
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret);
      const user = await User.findById(decoded.id).select('+refreshToken');
      
      if (!user || user.refreshToken !== token) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const tokens = this.generateTokens(user._id);
      
      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    return {
      success: true,
      resetToken, // In production, send via email
    };
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    return true;
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    return true;
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    const user = await User.findOne({ emailVerificationToken: token });
    
    if (!user) {
      throw new ApiError(400, 'Invalid verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return user;
  }

  /**
   * Generate email verification token
   */
  async resendVerificationEmail(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isEmailVerified) {
      throw new ApiError(400, 'Email already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    await user.save();

    return {
      token: verificationToken, // In production, send via email
    };
  }
}

module.exports = new AuthService();

