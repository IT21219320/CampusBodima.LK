import express from 'express';
import {getIntent, getPath, getPublichkey, getWebHook, makePayment} from "../controllers/paymentContollers.js";

const router = express.Router();

router.get('/',getPath);
router.get('/config', getPublichkey);
router.post('/make', makePayment);
router.route('/create-payment-intent').post(getIntent);
router.post('/webhook', getWebHook);



export default router;