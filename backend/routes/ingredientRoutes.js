import express from 'express';
import {addIngredient,getOwnerIngredient,updateIngredient,deleteIngredient} from '../controllers/ingredientController.js'; 

const router = express.Router();

router.post('/add', addIngredient);
router.get('/owner/:ownerId/:page', getOwnerIngredient);
router.put('/owner', updateIngredient);
router.delete('/owner/:ownerId/:ingredientId', deleteIngredient);

export default router;