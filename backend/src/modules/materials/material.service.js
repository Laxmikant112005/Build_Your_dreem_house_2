/**
 * BuildMyHome - Material Service
 * Business logic for material marketplace
 */

const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');
const Material = require('./material.model');
const Category = require('../category/category.model');

const materialService = {
  // Create material (admin/engineer)
  createMaterial: asyncHandler(async (data) => {
    const material = await Material.create(data);
    return material;
  }),

  // Get all materials with filters
  getMaterials: asyncHandler(async (filters = {}, options = {}) => {
    const { page = 1, limit = 20, category, supplier, minPrice, maxPrice, search, sortBy = 'createdAt', sortOrder = 'desc', featured } = options;

    const query = { status: 'approved', ...filters };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (minPrice) query.price = { ...query.price, $gte: minPrice };
    if (maxPrice) query.price.$lte = maxPrice;
    if (featured === 'true') query.featured = true;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    const [materials, total] = await Promise.all([
      Material.find(query)
        .populate('category', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Material.countDocuments(query)
    ]);

    return { materials, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }),

  // Get single material
  getMaterialById: asyncHandler(async (id) => {
    const material = await Material.findById(id).populate('category');
    if (!material) throw new ApiError(404, 'Material not found');
    return material;
  }),

  // Update material
  updateMaterial: asyncHandler(async (id, updateData) => {
    const material = await Material.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('category');
    if (!material) throw new ApiError(404, 'Material not found');
    return material;
  }),

  // Delete material (admin)
  deleteMaterial: asyncHandler(async (id) => {
    const material = await Material.findByIdAndDelete(id);
    if (!material) throw new ApiError(404, 'Material not found');
    return material;
  }),

  // Get materials by category
  getMaterialsByCategory: asyncHandler(async (categoryId, options = {}) => {
    return materialService.getMaterials({ category: categoryId }, options);
  }),
};

module.exports = materialService;

