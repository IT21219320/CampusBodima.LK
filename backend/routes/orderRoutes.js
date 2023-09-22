import express from 'express';
import { createOrder, deleteOrder, getOrder, updateOrder } from '../controllers/orderController.js'; 

const router = express.Router();


router.post('/create', createOrder);
router.get('/get', getOrder);
router.get('/update',updateOrder);
router.get('/delete',deleteOrder);

export default router;
