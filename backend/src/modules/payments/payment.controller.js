/**
 * BuildMyHome - Payment Controller (Razorpay Integration)
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const paymentService = require('./payment.service');
const bookingService = require('../booking/booking.service');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay order for booking
 */
const createOrder = asyncHandler(async (req, res) => {
  const { bookingId, amount } = req.body;

  // Verify booking belongs to user
  const booking = await bookingService.getBookingById(bookingId);
  if (booking.userId.toString() !== req.userId) {
    return ApiResponse.unauthorized(res, 'Unauthorized booking');
  }

  if (booking.status !== 'pending') {
    return ApiResponse.badRequest(res, 'Booking not ready for payment');
  }

  const options = {
    amount: amount * 100, // paise
    currency: 'INR',
    receipt: `booking_${bookingId}`,
  };

  const order = await razorpay.orders.create(options);
  
  // Save pending payment
  const payment = await paymentService.createPayment({
    bookingId,
    razorpayOrderId: order.id,
    amount,
    status: 'pending',
  });

  ApiResponse.created(res, 'Payment order created', {
    razorpayOrderId: order.id,
    amount: order.amount / 100,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
    name: 'BuildMyHome',
    description: `Booking #${bookingId}`,
    prefill: {
      name: req.user.firstName + ' ' + req.user.lastName,
      email: req.user.email,
      contact: req.user.phone || undefined,
    },
    handler: 'paymentSuccess',
  });
});

/**
 * Verify payment signature (client callback)
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return ApiResponse.badRequest(res, 'Invalid payment signature');
  }

  // Update payment & booking
  await paymentService.verifyPayment(razorpay_payment_id, razorpay_order_id);
  await bookingService.updateStatus(bookingId, 'confirmed');

  ApiResponse.ok(res, 'Payment verified and booking confirmed');
});

/**
 * Payment webhook (server-side verification)
 */
const webhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const receivedSignature = req.headers['x-razorpay-signature'];
  const body = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');

  if (expectedSignature !== receivedSignature) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  // Handle event
  const event = body.event;
  if (event === 'payment.captured') {
    const paymentId = body.payload.payment.entity.id;
    await paymentService.handlePaymentSuccess(paymentId);
  }

  res.status(200).json({ message: 'Webhook received' });
});

module.exports = {
  createOrder,
  verifyPayment,
  webhook,
};

