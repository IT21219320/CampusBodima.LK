import express from 'express';
import { addUtilities, deleteUtility, getBoarding, getOccupant, getUtilityBoarding, getUtilitiesForBoarding, getUtilitiesForOccupant, updateUtility, getFacilitiesBoarding } from '../controllers/utilityController.js';


const router = express.Router();
router.post('/addUtility',addUtilities);
router.get('/owner/:boardingId/:utilityType/:page',getUtilitiesForBoarding);
router.get('occupants/:occupantId/:boardingId/:utilityType',getUtilitiesForOccupant);
router.put('/owner/:boardingId/:utillityType/:utilityId',updateUtility);
router.delete('/owner/:boardingId/:utilityId/:utilityType',deleteUtility);
router.get(  '/owner/:ownerId',getUtilityBoarding);
router.get('/boarding/:boardingId',getOccupant);
router.get('/owner/:owneId/:facilities',getFacilitiesBoarding);
export default router;