/**
 * BuildMyHome - Category Controller
 * Request handlers for category endpoints
 */

const categoryService = require('./category.service');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

/**
 * Get all categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const { featured, parentOnly } = req.query;

  let categories;
  if (featured === 'true') {
    categories = await categoryService.getFeaturedCategories();
  } else if (parentOnly === 'true') {
    categories = await categoryService.getParentCategories();
  } else {
    categories = await categoryService.getAllCategories();
  }

  ApiResponse.ok(res, 'Categories retrieved successfully', categories);
});

/**
 * Get category by ID
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id);

  if (!category) {
    return ApiResponse.notFound(res, 'Category not found');
  }

  ApiResponse.ok(res, 'Category retrieved successfully', category);
});

/**
 * Get category by slug
 */
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await categoryService.getCategoryBySlug(slug);

  if (!category) {
    return ApiResponse.notFound(res, 'Category not found');
  }

  ApiResponse.ok(res, 'Category retrieved successfully', category);
});

/**
 * Get category hierarchy (tree structure)
 */
const getCategoryHierarchy = asyncHandler(async (req, res) => {
  const hierarchy = await categoryService.getCategoryHierarchy();
  ApiResponse.ok(res, 'Category hierarchy retrieved successfully', hierarchy);
});

/**
 * Get category path (breadcrumb)
 */
const getCategoryPath = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const path = await categoryService.getCategoryPath(id);

  if (!path || path.length === 0) {
    return ApiResponse.notFound(res, 'Category not found');
  }

  ApiResponse.ok(res, 'Category path retrieved successfully', path);
});

/**
 * Get subcategories
 */
const getSubcategories = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subcategories = await categoryService.getSubcategories(id);
  ApiResponse.ok(res, 'Subcategories retrieved successfully', subcategories);
});

/**
 * Create category (admin only)
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, image, parentId, order, isFeatured, metaTitle, metaDescription } = req.body;

  const category = await categoryService.createCategory({
    name,
    description,
    icon,
    image,
    parentId,
    order,
    isFeatured,
    metaTitle,
    metaDescription,
  });

  ApiResponse.created(res, 'Category created successfully', category);
});

/**
 * Update category (admin only)
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const category = await categoryService.updateCategory(id, updateData);

  if (!category) {
    return ApiResponse.notFound(res, 'Category not found');
  }

  ApiResponse.ok(res, 'Category updated successfully', category);
});

/**
 * Delete category (admin only)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await categoryService.deleteCategory(id);

  if (!result) {
    return ApiResponse.notFound(res, 'Category not found');
  }

  ApiResponse.ok(res, 'Category deleted successfully');
});

/**
 * Get category designs
 */
const getCategoryDesigns = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const result = await categoryService.getCategoryDesigns(id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  ApiResponse.ok(res, 'Category designs retrieved successfully', result);
});

module.exports = {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  getCategoryHierarchy,
  getCategoryPath,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryDesigns,
};

