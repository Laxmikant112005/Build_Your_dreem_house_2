/**
 * BuildMyHome - Order Controller
 */

const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const orderService = require('./order.service');

const orderController = {
  createOrder: asyncHandler(async (req, res) => {
    const order = await orderService.createOrder({
      ...req.body,
      userId: req.user._id,
    });
    ApiResponse.created(res, 'Order created successfully', order);
  }),

  getMyOrders: asyncHandler(async (req, res) => {
    const result = await orderService.getUserOrders(req.user._id, req.query);
    ApiResponse.ok(res, 'Orders retrieved', result);
  }),

  getOrder: asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user._id);
    ApiResponse.ok(res, 'Order details', order);
  }),

  cancelOrder: asyncHandler(async (req, res) => {
    // Implementation for cancel (status update)
    ApiResponse.ok(res, 'Order cancelled');
  }),
};

module.exports = orderController;

