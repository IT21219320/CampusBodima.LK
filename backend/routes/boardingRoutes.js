import express from 'express';
import { registerBoarding, addRoom, getOwnerBoardings, getOccupantBoarding, updateBoardingVisibility, deleteBoarding } from '../controllers/boardingController.js';

const router = express.Router();

router.post('/register', registerBoarding);
router.post('/addroom', addRoom);
router.get('/owner/:ownerId/:page/:status', getOwnerBoardings);
router.get('/occupant/:occupantId', getOccupantBoarding);
router.put('/updateBoardingVisibility', updateBoardingVisibility);
router.delete('/deleteBoarding/:boardingId', deleteBoarding)

export default router;
