/**
 * BuildMyHome - Field Model
 * User land plot mapping with polygon coordinates
 */

const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coordinates: [{
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    }],
    area: {
      type: Number, // sq meters, approximate
      required: true,
    },
    locationName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
    },
    center: {
      lat: Number,
      lng: Number,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
fieldSchema.index({ userId: 1 });
fieldSchema.index({ isDefault: 1 });

const Field = mongoose.model('Field', fieldSchema);

module.exports = Field;

