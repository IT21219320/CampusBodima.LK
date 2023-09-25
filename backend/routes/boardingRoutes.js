import express from 'express';
import { registerBoarding, addRoom, getAllBoardings, getAllPublicBoardings, getOwnerBoardings, getBoardingById, getOccupantBoarding, getPendingApprovalBoardings, approveBoarding, rejectBoarding, updateBoardingVisibility, updateBoarding, deleteBoarding } from '../controllers/boardingController.js';

const router = express.Router();

// api/boarding
router.post('/register', registerBoarding);
router.post('/addroom', addRoom);
router.post('/all', getAllBoardings);
router.post('/search', getAllPublicBoardings);
router.get('/owner/:ownerId/:page/:status', getOwnerBoardings);
router.get('/:boardingId', getBoardingById);
router.get('/occupant/:occupantId', getOccupantBoarding);
router.get('/pendingApproval/:page/:pageSize', getPendingApprovalBoardings);
router.put('/approveBoarding', approveBoarding);
router.put('/rejectBoarding', rejectBoarding);
router.put('/updateBoardingVisibility', updateBoardingVisibility);
router.put('/updateBoarding', updateBoarding);
router.delete('/deleteBoarding/:boardingId', deleteBoarding)

export default router;
