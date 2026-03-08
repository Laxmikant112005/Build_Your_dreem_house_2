/**
 * BuildMyHome - Design Model
 * Mongoose schema for house designs
 */

const mongoose = require('mongoose');
const { DESIGN_STATUS, HOUSE_STYLES, CONSTRUCTION_TYPES } = require('../../constants/enums');
const slugify = require('slugify');

const designSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Design title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    specifications: {
      totalArea: {
        type: Number,
        required: true,
        min: 0,
      },
      landWidth: {
        type: Number,
        min: 0,
      },
      landLength: {
        type: Number,
        min: 0,
      },
      floors: {
        type: Number,
        required: true,
        min: 1,
        max: 50,
      },
      bedrooms: {
        type: Number,
        default: 0,
        min: 0,
      },
      bathrooms: {
        type: Number,
        default: 0,
        min: 0,
      },
      livingRooms: {
        type: Number,
        default: 0,
        min: 0,
      },
      kitchen: {
        type: Number,
        default: 0,
        min: 0,
      },
      garage: {
        type: Number,
        default: 0,
        min: 0,
      },
      style: {
        type: String,
        enum: HOUSE_STYLES,
        required: true,
      },
      constructionType: {
        type: String,
        enum: CONSTRUCTION_TYPES,
        required: true,
      },
      estimatedCost: {
        type: Number,
        min: 0,
      },
      estimatedDuration: {
        type: Number, // in days
        min: 0,
      },
    },
    location: {
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        default: 'India',
      },
    },
    files: {
      images: [{
        url: String,
        thumbnailUrl: String,
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      }],
      floorPlans: [{
        url: String,
        name: String,
        floor: Number,
      }],
      cadFiles: [{
        url: String,
        name: String,
        format: String,
      }],
      model3d: {
        url: String,
        thumbnailUrl: String,
        format: String,
      },
      documents: [{
        url: String,
        name: String,
        type: String,
      }],
    },
    status: {
      type: String,
      enum: Object.values(DESIGN_STATUS),
      default: DESIGN_STATUS.DRAFT,
    },
    rejectionReason: String,
    metrics: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      saves: {
        type: Number,
        default: 0,
      },
      bookings: {
        type: Number,
        default: 0,
      },
    },
    tags: [{
      type: String,
      trim: true,
    }],
    metaTitle: {
      type: String,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      maxlength: 160,
    },
    publishedAt: Date,
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
designSchema.index({ engineerId: 1 });
designSchema.index({ category: 1 });
designSchema.index({ status: 1 });
designSchema.index({ 'specifications.style': 1 });
designSchema.index({ 'specifications.estimatedCost': 1 });
designSchema.index({ 'specifications.totalArea': 1 });
designSchema.index({ 'location.city': 1 });
designSchema.index({ createdAt: -1 });
designSchema.index({ slug: 1 });

// Compound indexes for filtering
designSchema.index({ status: 1, category: 1 });
designSchema.index({ status: 1, 'specifications.style': 1 });
designSchema.index({ status: 1, 'specifications.estimatedCost': 1 });

// Text search index
designSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for like count (placeholder for separate collection)
designSchema.virtual('likes', {
  ref: 'Favorite',
  localField: '_id',
  foreignField: 'designId',
  count: true,
});

// Pre-save middleware to generate slug
designSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

// Method to increment view count
designSchema.methods.incrementViews = async function () {
  this.metrics.views += 1;
  await this.save();
};

// Static method to get featured designs
designSchema.statics.getFeatured = function (limit = 10) {
  return this.find({ status: DESIGN_STATUS.APPROVED })
    .sort({ 'metrics.views': -1, 'metrics.likes': -1 })
    .limit(limit)
    .populate('engineerId', 'firstName lastName avatar engineerProfile.rating');
};

// Static method to get trending designs
designSchema.statics.getTrending = function (days = 7, limit = 10) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return this.find({
    status: DESIGN_STATUS.APPROVED,
    publishedAt: { $gte: date },
  })
    .sort({ 'metrics.views': -1, 'metrics.likes': -1 })
    .limit(limit)
    .populate('engineerId', 'firstName lastName avatar engineerProfile.rating');
};

const Design = mongoose.model('Design', designSchema);

module.exports = Design;

