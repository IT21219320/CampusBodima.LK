import express from 'express';
import {addIngredient,getBoardingIngredient,getOwnerBoarding,updateIngredient,deleteIngredient} from '../controllers/ingredientController.js'; 

const router = express.Router();

router.post('/add', addIngredient);
router.get('/owner/:boardingId/:page', getBoardingIngredient);
router.get('/owner/:ownerId', getOwnerBoarding);
router.put('/owner', updateIngredient);
router.delete('/owner/:boardingId/:ingredientId', deleteIngredient);

export default router;