import express from 'express';
import { createOrder, deleteOrder, getOrder, updateOrder } from '../controllers/orderController.js'; 

const router = express.Router();


router.post('/createOrder', createOrder);
router.get('/getOrder', getOrder);
router.get('/updateOrder',updateOrder);
router.get('/deleteOrder',deleteOrder);

export default router;
