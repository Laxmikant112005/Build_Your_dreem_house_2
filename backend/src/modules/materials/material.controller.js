/**
 * BuildMyHome - Material Controller
 * HTTP request handlers for material endpoints
 */

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const materialService = require('./material.service');
const { ROLE } = require('../../constants/roles');
const authorize = require('../../middleware/auth.middleware').authorize;

const materialController = {
  // Create material
  createMaterial: asyncHandler(async (req, res) => {
    const material = await materialService.createMaterial(req.body);
    ApiResponse.created(res, 'Material created successfully', material);
  }),

  // Get all materials
  getMaterials: asyncHandler(async (req, res) => {
    const result = await materialService.getMaterials({}, req.query);
    ApiResponse.ok(res, 'Materials retrieved successfully', result);
  }),

  // Get single material
  getMaterial: asyncHandler(async (req, res) => {
    const material = await materialService.getMaterialById(req.params.id);
    ApiResponse.ok(res, 'Material retrieved successfully', material);
  }),

  // Update material
  updateMaterial: asyncHandler(async (req, res) => {
    const material = await materialService.updateMaterial(req.params.id, req.body);
    ApiResponse.ok(res, 'Material updated successfully', material);
  }),

  // Delete material
  deleteMaterial: asyncHandler(async (req, res) => {
    await materialService.deleteMaterial(req.params.id);
    ApiResponse.ok(res, 'Material deleted successfully');
  }),
};

module.exports = materialController;

