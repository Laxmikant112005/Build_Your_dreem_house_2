/**
 * BuildMyHome - Availability Model
 * Engineer calendar and scheduling
 */

const mongoose = require('mongoose');
const { AVAILABILITY_STATUS } = require('../../constants/enums'); // available|booked|blocked

const availabilitySchema = new mongoose.Schema(
  {
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlots: [{
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
      isBooked: {
        type: Boolean,
        default: false,
      },
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      }
    }],
    status: {
      type: String,
      enum: Object.values(AVAILABILITY_STATUS || { AVAILABLE: 'available', BOOKED: 'booked', BLOCKED: 'blocked' }),
      default: 'available',
    },
    notes: String,
    recurring: {
      type: Boolean,
      default: false,
    },
    weekDay: {
      type: Number, // 0=Sunday ... 6=Saturday
      min: 0,
      max: 6,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Compound indexes for queries
availabilitySchema.index({ engineerId: 1, date: 1, status: 1 });
availabilitySchema.index({ engineerId: 1, weekDay: 1 });
availabilitySchema.index({ status: 1 });

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;

