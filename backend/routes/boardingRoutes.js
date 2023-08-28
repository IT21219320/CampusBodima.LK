import express from 'express';
import { registerBoarding, addRoom, getOwnerBoardings, getOccupantBoarding } from '../controllers/boardingController.js';

const router = express.Router();

router.post('/register', registerBoarding);
router.post('/addroom', addRoom);
router.get('/owner/:ownerId', getOwnerBoardings);
router.get('/occupant/:occupantId', getOccupantBoarding);

export default router;
