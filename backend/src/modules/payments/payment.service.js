/**
 * BuildMyHome - Payment Service
 * Payment processing logic (integrates with Stripe/Razorpay)
 */

const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const Payment = require('./payment.model');
const Order = require('../orders/order.model');

const paymentService = {
  createPaymentIntent: asyncHandler(async (orderId, paymentData) => {
    const order = await Order.findById(orderId).populate('userId');
    if (!order || order.paymentStatus === 'paid') {
      throw new ApiError(400, 'Invalid order for payment');
    }

    // TODO: Integrate with actual gateway (Stripe.createPaymentIntent)
    const payment = await Payment.create({
      ...paymentData,
      orderId,
      userId: order.userId._id,
      amount: order.totalAmount,
    });

    return payment.populate('orderId');
  }),

  verifyPayment: asyncHandler(async (gatewayTransactionId, gatewayData) => {
    // TODO: Verify with gateway webhook
    const payment = await Payment.findOne({ gatewayTransactionId });
    if (!payment) throw new ApiError(404, 'Payment not found');

    payment.status = 'paid';
    payment.gatewayResponse = gatewayData;
    await payment.save();

    // Update order
    const order = await Order.findById(payment.orderId);
    order.paymentStatus = 'paid';
    await order.save();

    return payment;
  }),

  getUserPayments: asyncHandler(async (userId, options = {}) => {
    const query = { userId };
    const payments = await Payment.find(query)
      .populate('orderId', 'totalAmount status')
      .sort({ createdAt: -1 });
    return payments;
  }),
};

module.exports = paymentService;

