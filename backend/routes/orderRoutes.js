import express from 'express';
import { createOrder, getAllOrders } from '../controllers/orderController.js'; 
const router = express.Router();


   // Create a new order
   router.post('/create', createOrder);

   // Get all orders
   router.get('/all', getAllOrders);

   export default router;
