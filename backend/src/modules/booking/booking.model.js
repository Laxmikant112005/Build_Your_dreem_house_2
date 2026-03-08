/**
 * BuildMyHome - Booking Model
 * Mongoose schema for bookings
 */

const mongoose = require('mongoose');
const { BOOKING_STATUS, BOOKING_TYPE, MEETING_TYPE } = require('../../constants/enums');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },
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
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
    },
    type: {
      type: String,
      enum: Object.values(BOOKING_TYPE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    meetingType: {
      type: String,
      enum: Object.values(MEETING_TYPE),
      default: MEETING_TYPE.VIDEO,
    },
    meetingLink: {
      type: String,
    },
    location: {
      address: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    projectDetails: {
      landSize: Number,
      budget: Number,
      requirements: String,
      timeline: String,
    },
    pricing: {
      consultationFee: {
        type: Number,
        default: 0,
      },
      designFee: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    timeline: {
      requestedAt: {
        type: Date,
        default: Date.now,
      },
      confirmedAt: Date,
      startedAt: Date,
      completedAt: Date,
      cancelledAt: Date,
      cancellationReason: String,
    },
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    notes: {
      type: String,
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    internalNotes: {
      type: String,
    },
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
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ engineerId: 1 });
bookingSchema.index({ designId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Compound indexes
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ engineerId: 1, status: 1 });
bookingSchema.index({ engineerId: 1, scheduledDate: 1 });

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await this.constructor.countDocuments();
    this.bookingId = `BMH-${Date.now().toString(36).toUpperCase()}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Static method to generate booking ID
bookingSchema.statics.generateBookingId = async function () {
  const count = await this.countDocuments();
  return `BMH-${Date.now().toString(36).toUpperCase()}${(count + 1).toString().padStart(4, '0')}`;
};

// Virtual for user
bookingSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for engineer
bookingSchema.virtual('engineer', {
  ref: 'User',
  localField: 'engineerId',
  foreignField: '_id',
  justOne: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

