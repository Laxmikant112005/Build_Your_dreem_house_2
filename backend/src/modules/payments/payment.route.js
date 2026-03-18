/**
 * BuildMyHome - Payment Routes
 */

const express = require('express');
const authenticate = require('../../middleware/auth.middleware').authenticate;
const paymentController = require('./payment.controller');

const router = express.Router();

router.post('/intent/:orderId', authenticate, paymentController.createPaymentIntent);

router.post('/verify', paymentController.verifyPayment); // Webhook

router.get('/my-payments', authenticate, paymentController.getPayments);

module.exports = router;

