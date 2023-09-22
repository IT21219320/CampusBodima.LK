import express from 'express';
import {addIngredient,getBoardingIngredient,getBoardingIngredientNames,getOwnerBoarding,updateIngredient,getUpdateIngredients,deleteIngredient} from '../controllers/ingredientController.js'; 

const router = express.Router();

router.post('/add', addIngredient);
router.post('/owner/ingredients', getBoardingIngredient);
router.post('/owner/ingredients/names', getBoardingIngredientNames);
router.get('/owner/:ownerId', getOwnerBoarding);
router.put('/owner', updateIngredient);
router.get('/owner/update/:boardingId/:ingredientId', getUpdateIngredients);
router.delete('/owner/:boardingId/:ingredientId', deleteIngredient);

export default router;