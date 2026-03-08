/**
 * BuildMyHome - Category Service
 * Business logic for category operations
 */

const Category = require('./category.model');
const Design = require('../design/design.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

class CategoryService {
  /**
   * Get all categories
   */
  async getAllCategories() {
    return Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .select('-__v');
  }

  /**
   * Get featured categories
   */
  async getFeaturedCategories() {
    return Category.find({ isActive: true, isFeatured: true })
      .sort({ order: 1, name: 1 })
      .select('-__v');
  }

  /**
   * Get parent categories only
   */
  async getParentCategories() {
    return Category.find({ parentId: null, isActive: true })
      .sort({ order: 1, name: 1 })
      .select('-__v');
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId) {
    return Category.findById(categoryId).select('-__v');
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug) {
    return Category.findOne({ slug, isActive: true }).select('-__v');
  }

  /**
   * Get category hierarchy (tree structure)
   */
  async getCategoryHierarchy() {
    return Category.getHierarchy();
  }

  /**
   * Get category path (breadcrumb)
   */
  async getCategoryPath(categoryId) {
    return Category.getCategoryPath(categoryId);
  }

  /**
   * Get subcategories
   */
  async getSubcategories(categoryId) {
    return Category.find({ parentId: categoryId, isActive: true })
      .sort({ order: 1, name: 1 })
      .select('-__v');
  }

  /**
   * Create category
   */
  async createCategory(data) {
    const { name, description, icon, image, parentId, order, isFeatured, metaTitle, metaDescription } = data;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new ApiError(400, 'Category with this name already exists');
    }

    // Verify parent exists if provided
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        throw new ApiError(404, 'Parent category not found');
      }
    }

    const category = new Category({
      name,
      description,
      icon,
      image,
      parentId: parentId || null,
      order: order || 0,
      isFeatured: isFeatured || false,
      metaTitle,
      metaDescription,
    });

    await category.save();
    return category;
  }

  /**
   * Update category
   */
  async updateCategory(categoryId, updateData) {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Check for duplicate name
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({ name: updateData.name });
      if (existingCategory) {
        throw new ApiError(400, 'Category with this name already exists');
      }
    }

    // Verify new parent exists if provided
    if (updateData.parentId) {
      if (updateData.parentId === categoryId) {
        throw new ApiError(400, 'Category cannot be its own parent');
      }
      const parentCategory = await Category.findById(updateData.parentId);
      if (!parentCategory) {
        throw new ApiError(404, 'Parent category not found');
      }
    }

    Object.assign(category, updateData);
    await category.save();
    return category;
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId) {
    const category = await Category.findById(categoryId);

    if (!category) {
      return null;
    }

    // Check if category has subcategories
    const subcategories = await Category.countDocuments({ parentId: categoryId });
    if (subcategories > 0) {
      throw new ApiError(400, 'Cannot delete category with subcategories. Delete subcategories first.');
    }

    // Check if category has designs
    const designs = await Design.countDocuments({ category: categoryId });
    if (designs > 0) {
      // Instead of deleting, just mark as inactive
      category.isActive = false;
      await category.save();
      return category;
    }

    await category.deleteOne();
    return true;
  }

  /**
   * Get designs in a category
   */
  async getCategoryDesigns(categoryId, options) {
    const { page = 1, limit = 20 } = options;

    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Get all subcategory IDs
    const getAllSubcategoryIds = async (parentId) => {
      const subcategories = await Category.find({ parentId, isActive: true }).select('_id');
      let allIds = subcategories.map((c) => c._id);
      for (const sub of subcategories) {
        const nestedIds = await getAllSubcategoryIds(sub._id);
        allIds = [...allIds, ...nestedIds];
      }
      return allIds;
    };

    const categoryIds = [categoryId, ...(await getAllSubcategoryIds(categoryId))];

    const skip = (page - 1) * limit;

    const [designs, total] = await Promise.all([
      Design.find({ category: { $in: categoryIds }, status: 'approved' })
        .populate('engineerId', 'firstName lastName avatar engineerProfile.rating')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Design.countDocuments({ category: { $in: categoryIds }, status: 'approved' }),
    ]);

    return {
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
      },
      designs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Get all subcategory IDs
    const getAllSubcategoryIds = async (parentId) => {
      const subcategories = await Category.find({ parentId, isActive: true }).select('_id');
      let allIds = subcategories.map((c) => c._id);
      for (const sub of subcategories) {
        const nestedIds = await getAllSubcategoryIds(sub._id);
        allIds = [...allIds, ...nestedIds];
      }
      return allIds;
    };

    const categoryIds = [categoryId, ...(await getAllSubcategoryIds(categoryId))];

    const [totalDesigns, subcategoriesCount] = await Promise.all([
      Design.countDocuments({ category: { $in: categoryIds }, status: 'approved' }),
      Category.countDocuments({ parentId: categoryId, isActive: true }),
    ]);

    return {
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
      },
      totalDesigns,
      subcategoriesCount,
    };
  }
}

module.exports = new CategoryService();

