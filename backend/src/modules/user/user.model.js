/**
 * BuildMyHome - User Model
 * Mongoose schema for users
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLE } = require('../../constants/roles');
const { VERIFICATION_STATUS } = require('../../constants/enums');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      budgetMin: {
        type: Number,
        default: 0,
      },
      budgetMax: {
        type: Number,
        default: 0,
      },
      preferredStyles: [{
        type: String,
      }],
      preferredLocations: [{
        type: String,
      }],
      landSize: {
        type: Number,
      },
      desiredRooms: {
        type: Number,
      },
    },
    engineerProfile: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verificationStatus: {
        type: String,
        enum: Object.values(VERIFICATION_STATUS),
        default: VERIFICATION_STATUS.PENDING,
      },
      licenseNumber: {
        type: String,
      },
      specializations: [{
        type: String,
      }],
      experience: {
        type: Number,
        default: 0,
      },
      serviceAreas: [{
        location: String,
        radiusKm: Number,
      }],
      availability: [{
        dayOfWeek: {
          type: Number,
          min: 0,
          max: 6,
        },
        startTime: String,
        endTime: String,
      }],
      portfolio: [{
        title: String,
        description: String,
        images: [String],
        completedDate: Date,
      }],
      rating: {
        average: {
          type: Number,
          default: 0,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    },
    refreshToken: {
      type: String,
      select: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is engineer
userSchema.methods.isEngineer = function () {
  return this.role === ROLE.ENGINEER;
};

// Method to check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === ROLE.ADMIN;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

