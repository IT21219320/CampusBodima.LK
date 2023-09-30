import express from 'express';
import { getReservationHistory, myReservationHistory } from '../controllers/reservationHistoryController.js'

const router = express.Router();

router.post('/BoardingHistory', getReservationHistory);
router.post('/myHistory' , myReservationHistory);


export default router;