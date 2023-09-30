import express from 'express';
import { getReservationHistory, myReservationHistory } from '../controllers/reservationHistoryController.js'

const router = express.Router();

router.get('/ReservationHistory', getReservationHistory);
router.get('/myHistory' , myReservationHistory);


export default router;