import express from 'express';
 

const router = express.Router();

router.get('/',getPath);
router.get('/config', getPublichkey);
router.post('/make', makePayment);
router.route('/create-payment-intent').post(getIntent);
router.post('/webhook', getWebHook);



export default router;