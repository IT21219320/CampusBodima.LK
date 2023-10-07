import express from 'express';
import { registerBoarding, addRoom, addOccupant, occupantJoin, getAllBoardings, getAllPublicBoardings, getOwnerBoardings, getBoardingById, getReservationsByBoardingId, getReservationsByRoomId, getRoomById, getOccupantBoarding, getPendingApprovalBoardings, approveBoarding, rejectBoarding, updateBoardingVisibility, updateRoomVisibility, updateBoarding, updateRoom, deleteBoarding, deleteRoom, deleteReservation } from '../controllers/boardingController.js';

const router = express.Router();

// api/boarding
router.post('/register', registerBoarding);
router.post('/addroom', addRoom);
router.post('/addoccupant', addOccupant);
router.post('/occupant/join', occupantJoin);
router.post('/all', getAllBoardings);
router.post('/search', getAllPublicBoardings);
router.get('/owner/:ownerId/:page/:status', getOwnerBoardings);
router.get('/:boardingId', getBoardingById);
router.get('/:boardingId/reservations', getReservationsByBoardingId);
router.get('/room/:roomId/reservations', getReservationsByRoomId);
router.get('/room/:roomId', getRoomById);
router.get('/occupant/:occupantId', getOccupantBoarding);
router.get('/pendingApproval/:page/:pageSize', getPendingApprovalBoardings);
router.put('/approveBoarding', approveBoarding);
router.put('/rejectBoarding', rejectBoarding);
router.put('/updateBoardingVisibility', updateBoardingVisibility);
router.put('/updateRoomVisibility', updateRoomVisibility);
router.put('/updateBoarding', updateBoarding);
router.put('/updateRoom', updateRoom);
router.delete('/deleteBoarding/:boardingId', deleteBoarding)
router.delete('/deleteRoom/:roomId', deleteRoom)
router.delete('/deleteReservation/:reservationId/', deleteReservation)

export default router;
