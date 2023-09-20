import express from 'express';
import { addCard, getCardById } from '../controllers/cardControllers.js';

const router = express.Router();

router.post('/addCard', addCard);
router.post('/getCard', getCardById);


export default router;