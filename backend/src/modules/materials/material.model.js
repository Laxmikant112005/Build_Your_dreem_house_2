/**
 * BuildMyHome - Material Model
 * Mongoose schema for construction materials in marketplace
 */

const mongoose = require('mongoose');
const { MATERIAL_STATUS } = require('../../constants/enums'); // Add if needed

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
      maxlength: [100, 'Material name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Material category is required'],
    },
    supplier: {
      name: {
        type: String,
        required: [true, 'Supplier name is required'],
      },
      contact: String,
      location: String,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    priceUnit: {
      type: String,
      enum: ['per_unit', 'per_sqft', 'per_cubic_meter', 'per_ton'],
      default: 'per_unit',
    },
    images: [{
      type: String,
      default: [],
    }],
    specifications: {
      type: mongoose.Schema.Types.Mixed, // dimensions, weight, etc.
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    minOrderQuantity: {
      type: Number,
      min: 1,
      default: 1,
    },
    status: {
      type: String,
      enum: Object.values(MATERIAL_STATUS || { APPROVED: 'approved', PENDING: 'pending', REJECTED: 'rejected' }),
      default: 'approved',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
materialSchema.index({ category: 1 });
materialSchema.index({ 'supplier.location': 1 });
materialSchema.index({ price: 1 });
materialSchema.index({ status: 1, featured: 1 });
materialSchema.index({ createdAt: -1 });

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;

