/**
 * BuildMyHome - Field Service
 */

const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const Field = require('./field.model');

const fieldService = {
  createField: asyncHandler(async (data, userId) => {
    const existingDefault = await Field.findOne({ userId, isDefault: true });
    if (existingDefault && data.isDefault) {
      await Field.findByIdAndUpdate(existingDefault._id, { isDefault: false });
    }

    const field = await Field.create({ ...data, userId });
    return field.populate('userId', 'firstName lastName');
  }),

  getUserFields: asyncHandler(async (userId) => {
    return await Field.find({ userId }).sort({ updatedAt: -1 });
  }),

  getFieldById: asyncHandler(async (id, userId) => {
    const field = await Field.findOne({ _id: id, userId });
    if (!field) throw new ApiError(404, 'Field not found');
    return field;
  }),

  updateField: asyncHandler(async (id, updateData, userId) => {
    const field = await Field.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!field) throw new ApiError(404, 'Field not found');
    return field;
  }),

  deleteField: asyncHandler(async (id, userId) => {
    const field = await Field.findOneAndDelete({ _id: id, userId });
    if (!field) throw new ApiError(404, 'Field not found');
    return field;
  }),
};

module.exports = fieldService;

