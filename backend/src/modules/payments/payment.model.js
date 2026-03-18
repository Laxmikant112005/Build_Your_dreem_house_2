/**
 * BuildMyHome - Payment Model
 * Mongoose schema for order payments
 */

const mongoose = require('mongoose');
const { PAYMENT_STATUS, PAYMENT_METHOD } = require('../../constants/enums'); // pending|paid|failed|refunded; card|upi|wallet|cod

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: String,
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD || { CARD: 'card', UPI: 'upi', WALLET: 'wallet', COD: 'cod' }),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS || { PENDING: 'pending', PAID: 'paid', FAILED: 'failed', REFUNDED: 'refunded' }),
      default: 'pending',
    },
    gateway: {
      type: String,
      required: true, // stripe, razorpay, etc.
    },
    gatewayTransactionId: {
      type: String,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    refundId: String,
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

