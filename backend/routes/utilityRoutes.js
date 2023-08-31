import express from 'express';
import { addUtilities, deleteUtility, getUtilitiesForBoarding, getUtilitiesForOccupant, updateUtility } from '../controllers/utilityController.js';


const router = express.Router();
router.post('/addUtility',addUtilities);
router.get('/owner/:boardingId/:utilityType',getUtilitiesForBoarding);
router.get('occupants/:occupantId/:boardingId/:utilityType',getUtilitiesForOccupant);
router.put('/owner/:boardingId/:utillityType/:utilityId',updateUtility);
router.delete('/owner/:boardingId/:utilityId/:utilityType',deleteUtility);
export default router;