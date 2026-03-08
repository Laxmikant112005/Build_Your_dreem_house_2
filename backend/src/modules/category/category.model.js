/**
 * BuildMyHome - Category Model
 * Mongoose schema for design categories
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    metaTitle: {
      type: String,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      maxlength: 160,
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
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ isActive: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Static method to get hierarchical categories
categorySchema.statics.getHierarchy = async function () {
  const rootCategories = await this.find({ parentId: null, isActive: true })
    .sort({ order: 1 })
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      options: { sort: { order: 1 } },
    });

  return rootCategories;
};

// Static method to get category path (breadcrumb)
categorySchema.statics.getCategoryPath = async function (categoryId) {
  const path = [];
  let currentCategory = await this.findById(categoryId);

  while (currentCategory) {
    path.unshift({
      id: currentCategory._id,
      name: currentCategory.name,
      slug: currentCategory.slug,
    });
    currentCategory = await this.findById(currentCategory.parentId);
  }

  return path;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

