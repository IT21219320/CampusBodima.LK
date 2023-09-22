import express from 'express';
import { addCard, getCardById, updateCard } from '../controllers/cardControllers.js';

const router = express.Router();

router.post('/addCard', addCard);
router.post('/getCard', getCardById);
router.put('/updateCard', updateCard);

export default router;