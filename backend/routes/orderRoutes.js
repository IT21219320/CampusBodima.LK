import express from 'express';
import { createOrder, deleteOrder, getOrder, getOrderById,updateStatus, updateOrder, getTodayOrder } from '../controllers/orderController.js'; 

const router = express.Router();


router.post('/create', createOrder);
router.post('/get', getOrder);
router.post('/gettoday', getTodayOrder);
router.get('/getOrderById/:_id',getOrderById);
router.put('/updateStatus',updateStatus);
router.put('/update',updateOrder);
router.delete('/delete',deleteOrder);

export default router;
