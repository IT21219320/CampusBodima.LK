import express from 'express';
import {getIntent, getPath, getPublichkey, getWebHook, makePayment,getPaymentsByUserID, getPaymentsByOwnerID,calcMonthlyPayment, getToDoPaymentsByUserCMonth, getToDoPaymentsByUser, getMyReservation, changeStatus, changeReservationPaidStatus} from "../controllers/paymentContollers.js";

const router = express.Router();

router.get('/',getPath);
router.get('/config', getPublichkey);
router.post('/make', makePayment);
router.post('/getPayment', getPaymentsByUserID);
router.post('/getPaymentOwner', getPaymentsByOwnerID);
router.post('/calc', calcMonthlyPayment);
router.post('/getToDoPaymentsByUserCMonth', getToDoPaymentsByUserCMonth);
router.post('/getToDoPaymentsByUser', getToDoPaymentsByUser);
router.post('/changeStatus', changeStatus);
router.post('/changeReservationPaidStatus', changeReservationPaidStatus);

router.post('/getMyRe', getMyReservation);
router.route('/create-payment-intent').post(getIntent);
router.post('/webhook', getWebHook);



export default router;