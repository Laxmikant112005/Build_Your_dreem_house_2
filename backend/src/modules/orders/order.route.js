/**
 * BuildMyHome - Order Routes
 */

const express = require('express');
const validate = require('../../middleware/validation.middleware');
const authenticate = require('../../middleware/auth.middleware').authenticate;
const orderController = require('./order.controller');

const router = express.Router();

router.post('/', 
  authenticate,
  validate(/* order validator */),
  orderController.createOrder
);

router.get('/my-orders', 
  authenticate,
  orderController.getMyOrders
);

router.get('/:id', 
  authenticate,
  orderController.getOrder
);

router.put('/:id/cancel', 
  authenticate,
  orderController.cancelOrder
);

module.exports = router;

