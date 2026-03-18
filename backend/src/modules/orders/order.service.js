/**
 * BuildMyHome - Order Service
 * Business logic for material orders
 */

const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const Order = require('./order.model');
const Material = require('../materials/material.model');
const { ORDER_STATUS } = require('../../constants/enums');

const orderService = {
  createOrder: asyncHandler(async (orderData) => {
    // Validate stock before creating
    for (const item of orderData.items) {
      const material = await Material.findById(item.materialId).select('stockQuantity price');
      if (!material || material.stockQuantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${material?.name}`);
      }
      // Update price if needed
      item.pricePerUnit = material.price;
      item.totalPrice = item.quantity * material.price;
    }

    const subtotal = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const order = await Order.create({
      ...orderData,
      subtotal,
      totalAmount: subtotal + (orderData.tax || 0) + (orderData.shipping || 0),
    });

    return order.populate(['userId', 'items.materialId']);
  }),

  getUserOrders: asyncHandler(async (userId, options = {}) => {
    const { page = 1, limit = 20, status } = options;
    const query = { userId, ...(status && { status }) };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.materialId')
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }),

  getOrderById: asyncHandler(async (id, userId) => {
    const order = await Order.findOne({ _id: id, userId })
      .populate('items.materialId')
      .populate('userId');
    if (!order) throw new ApiError(404, 'Order not found');
    return order;
  }),

  updateOrderStatus: asyncHandler(async (id, status, engineerId) => {
    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.engineerId && order.engineerId.toString() !== engineerId) {
      throw new ApiError(403, 'Not authorized to update this order');
    }
    order.status = status;
    await order.save();
    return order;
  }),
};

module.exports = orderService;

