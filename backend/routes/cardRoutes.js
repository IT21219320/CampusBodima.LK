import express from 'express';
import { addCard } from '../controllers/cardControllers.js';

const router = express.Router();

router.post('/addCard', addCard);


export default router;