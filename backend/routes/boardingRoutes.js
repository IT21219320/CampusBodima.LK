import express from 'express';
import { registerBoarding, addRoom, getAllBoardings, getOwnerBoardings, getBoardingById, getOccupantBoarding, updateBoardingVisibility, updateBoarding, deleteBoarding } from '../controllers/boardingController.js';

const router = express.Router();

// api/boarding
router.post('/register', registerBoarding);
router.post('/addroom', addRoom);
router.post('/all', getAllBoardings);
router.get('/owner/:ownerId/:page/:status', getOwnerBoardings);
router.get('/:boardingId', getBoardingById);
router.get('/occupant/:occupantId', getOccupantBoarding);
router.put('/updateBoardingVisibility', updateBoardingVisibility);
router.put('/updateBoarding', updateBoarding);
router.delete('/deleteBoarding/:boardingId', deleteBoarding)

export default router;
