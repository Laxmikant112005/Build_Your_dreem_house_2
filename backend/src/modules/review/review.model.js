/**
 * BuildMyHome - Review Model
 * Mongoose schema for reviews
 */

const mongoose = require('mongoose');
const { REVIEW_RATINGS } = require('../../constants/enums');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [REVIEW_RATINGS.MIN, `Rating must be at least ${REVIEW_RATINGS.MIN}`],
      max: [REVIEW_RATINGS.MAX, `Rating cannot exceed ${REVIEW_RATINGS.MAX}`],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: [{
      url: String,
      caption: String,
    }],
    pros: [{
      type: String,
      maxlength: [50, 'Pro item cannot exceed 50 characters'],
    }],
    cons: [{
      type: String,
      maxlength: [50, 'Con item cannot exceed 50 characters'],
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isHelpful: {
      type: Number,
      default: 0,
    },
    helpfulBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    response: {
      message: String,
      respondedAt: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
    },
    rejectionReason: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
reviewSchema.index({ userId: 1 });
reviewSchema.index({ engineerId: 1 });
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ designId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound indexes
reviewSchema.index({ engineerId: 1, status: 1 });
reviewSchema.index({ engineerId: 1, rating: 1 });
reviewSchema.index({ userId: 1, engineerId: 1 }, { unique: true });

// Static method to calculate average rating for engineer
reviewSchema.statics.calculateAverageRating = async function (engineerId) {
  const result = await this.aggregate([
    {
      $match: {
        engineerId: mongoose.Types.ObjectId.createFromHexString(engineerId),
        status: 'approved',
      },
    },
    {
      $group: {
        _id: '$engineerId',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    const { average, count } = result[0];
    await mongoose.model('User').findByIdAndUpdate(engineerId, {
      'engineerProfile.rating': {
        average: Math.round(average * 10) / 10,
        count,
      },
    });
  } else {
    await mongoose.model('User').findByIdAndUpdate(engineerId, {
      'engineerProfile.rating': {
        average: 0,
        count: 0,
      },
    });
  }

  return result[0] || { average: 0, count: 0 };
};

// Post-save middleware to update engineer rating
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.engineerId);
});

// Post-remove middleware to update engineer rating
reviewSchema.post('remove', async function () {
  await this.constructor.calculateAverageRating(this.engineerId);
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function (userId) {
  if (!this.helpfulBy.includes(userId)) {
    this.helpfulBy.push(userId);
    this.isHelpful += 1;
    await this.save();
  }
  return this;
};

// Method to add response
reviewSchema.methods.addResponse = async function (message) {
  this.response = {
    message,
    respondedAt: new Date(),
  };
  await this.save();
  return this;
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

