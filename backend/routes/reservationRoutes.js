import express from 'express';
import { reserveRoom,
         updateDuration, 
         getMyReservation, 
         getBoardingReservations, 
         getPendingReservations,
         approvePendingStatus,
         deletePendingStatus,
         deleteReservation 
    } from '../controllers/reservationController.js';
 

const router = express.Router();

router.post('/bookRoom', reserveRoom);
router.put('/updateDuration', updateDuration)
router.post('/MyRoom', getMyReservation);
router.post('/veiwReservations',getBoardingReservations);
router.post('/pending' ,getPendingReservations);
router.put('/aprovePending', approvePendingStatus);
router.delete('/deletePending', deletePendingStatus);
router.delete('/deleteReservation' , deleteReservation);

export default router;