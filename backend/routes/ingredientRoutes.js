import express from 'express';
import {addIngredient,getBoardingIngredient,getBoardingIngredientNames,getOwnerBoarding,updateIngredient,getUpdateIngredients,deleteIngredient,increaseIngredientQuantity,reduceIngredientQuantity,getIngredientHistoy,getKitchenUsersEmails,addKitchenUser,getManagerBoarding} from '../controllers/ingredientController.js'; 

const router = express.Router();

router.post('/add', addIngredient);
router.post('/add/manager', addKitchenUser);
router.post('/owner/ingredients', getBoardingIngredient);
router.post('/owner/ingredients/increase', increaseIngredientQuantity);
router.post('/owner/ingredients/reduce', reduceIngredientQuantity);
router.post('/owner/ingredients/names', getBoardingIngredientNames);
router.post('/manager/ingredients/emails', getKitchenUsersEmails);
router.get('/owner/:ownerId', getOwnerBoarding);
router.get('/manager/:managerId', getManagerBoarding);
router.put('/owner', updateIngredient);
router.get('/owner/update/:boardingId/:ingredientId', getUpdateIngredients);
router.delete('/owner/:boardingId/:ingredientId', deleteIngredient);
router.post('/owner/history', getIngredientHistoy);

export default router;