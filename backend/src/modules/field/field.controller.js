/**
 * BuildMyHome - Field Controller
 */

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const fieldService = require('./field.service');

const fieldController = {
  saveField: asyncHandler(async (req, res) => {
    const field = await fieldService.createField(req.body, req.user._id);
    ApiResponse.created(res, 'Field saved successfully', field);
  }),

  getMyFields: asyncHandler(async (req, res) => {
    const fields = await fieldService.getUserFields(req.user._id);
    ApiResponse.ok(res, 'Fields retrieved', fields);
  }),

  getField: asyncHandler(async (req, res) => {
    const field = await fieldService.getFieldById(req.params.id, req.user._id);
    ApiResponse.ok(res, 'Field retrieved', field);
  }),

  updateField: asyncHandler(async (req, res) => {
    const field = await fieldService.updateField(req.params.id, req.body, req.user._id);
    ApiResponse.ok(res, 'Field updated', field);
  }),

  deleteField: asyncHandler(async (req, res) => {
    await fieldService.deleteField(req.params.id, req.user._id);
    ApiResponse.ok(res, 'Field deleted');
  }),
};

module.exports = fieldController;

