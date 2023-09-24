import express from 'express';
import { createOrder, deleteOrder, getOrder, updateOrder } from '../controllers/orderController.js'; 

const router = express.Router();


router.post('/create', createOrder);
router.post('/get', getOrder);
router.put('/update/:id',updateOrder);
router.delete('/delete/:_id',deleteOrder);

export default router;
