import express from 'express';
import { getReservationHistory } from '../controllers/reservationHistoryController.js'

const router = express.Router();

router.get('/ReservationHistory', getReservationHistory);


export default router;