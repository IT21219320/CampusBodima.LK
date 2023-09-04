const express = require('express');
   const router = express.Router();
   const orderController = require('../controllers/orderController');

   // Create a new order
   router.post('/create', orderController.createOrder);

   // Get all orders
   router.get('/all', orderController.getAllOrders);

   module.exports = router;
