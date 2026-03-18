/**
 * BuildMyHome - OTP Service
 * OTP generation and validation logic
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../user/user.model');
const ApiError = require('../../utils/ApiError');
const config = require('../../config');
const logger = require('../../utils/logger');

class OTPService {
  /**
   * Generate 6-digit OTP
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hash OTP for storage
   */
  async hashOTP(otp) {
    return bcrypt.hash(otp, 10);
  }

  /**
   * Compare OTP
   */
  async compareOTP(plainOTP, hashedOTP) {
    return bcrypt.compare(plainOTP, hashedOTP);
  }

  /**
   * Send OTP to user (mock - log only)
   */
  async sendOTP(user, otp) {
    const message = `Your BuildMyHome verification OTP is: ${otp}. Valid for 5 minutes.`;
    logger.info(`OTP for ${user.email}: ${otp} (Sent via email/SMS)`);
    // TODO: Integrate nodemailer/twilio here
    return message;
  }

  /**
   * Generate and send OTP
   */
  async sendOTPToUser(emailOrPhone) {
    let user;
    
    if (emailOrPhone.includes('@')) {
      user = await User.findOne({ email: emailOrPhone.toLowerCase() });
    } else {
      user = await User.findOne({ phone: emailOrPhone });
    }

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isVerified) {
      throw new ApiError(400, 'User already verified');
    }

    const otp = this.generateOTP();
    const hashedOTP = await this.hashOTP(otp);
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = hashedOTP;
    user.otpExpiry = expiry;
    await user.save();

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`OTP (dev only) for ${user.email}: ${otp}`);
    }
    
    await this.sendOTP(user, otp);

    return { success: true, message: 'OTP sent successfully' };
  }


  /**
   * Verify OTP
   */
  async verifyOTP(emailOrPhone, otp) {
    let user;
    
    if (emailOrPhone.includes('@')) {
      user = await User.findOne({ email: emailOrPhone.toLowerCase() }).select('+otp +otpExpiry +invalidOtpAttempts');
    } else {
      user = await User.findOne({ phone: emailOrPhone }).select('+otp +otpExpiry +invalidOtpAttempts');
    }

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isVerified) {
      throw new ApiError(400, 'User already verified');
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      // Clear invalid OTP data
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      throw new ApiError(400, 'OTP expired. Please request a new one.');
    }

    const isValid = await this.compareOTP(otp, user.otp);
    if (!isValid) {
      user.invalidOtpAttempts = (user.invalidOtpAttempts || 0) + 1;
      if (user.invalidOtpAttempts >= 5) {
        user.otp = undefined;
        user.otpExpiry = undefined;
      }
      await user.save();
      throw new ApiError(400, 'Invalid OTP. Attempts left: ' + (5 - (user.invalidOtpAttempts || 0)));
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.invalidOtpAttempts = 0;
    user.isVerified = true;
    await user.save();

    return { success: true, userId: user._id };
  }

  /**
   * Resend OTP
   */
  async resendOTP(emailOrPhone) {
    let user;
    
    if (emailOrPhone.includes('@')) {
      user = await User.findOne({ email: emailOrPhone.toLowerCase() });
    } else {
      user = await User.findOne({ phone: emailOrPhone });
    }

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isVerified) {
      throw new ApiError(400, 'User already verified');
    }

    // Clear old OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.invalidOtpAttempts = 0;
    await user.save();

    return await this.sendOTPToUser(emailOrPhone);
  }

}

module.exports = new OTPService();

