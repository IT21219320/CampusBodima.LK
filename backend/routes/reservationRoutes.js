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
router.get('/MyRoom', getMyReservation);
router.get('/veiwReservations',getBoardingReservations);
router.get('/pending' ,getPendingReservations);
router.put('/aprovePending', approvePendingStatus);
router.delete('/deletePending', deletePendingStatus);
router.delete('daleteReservation' , deleteReservation);

export default router;