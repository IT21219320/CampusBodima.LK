import express from 'express';
import { addUtilities, deleteUtility, getBoarding, getOccupant, getUtilityBoarding, getUtilitiesForBoarding, getUtilitiesForOccupant, updateUtility, getFacilitiesBoarding, getUpdateUtility } from '../controllers/utilityController.js';


const router = express.Router();
router.post('/addUtility',addUtilities);
router.post('/owner/utilities',getUtilitiesForBoarding);
router.get('occupants/:occupantId/:boardingId/:utilityType',getUtilitiesForOccupant);
router.put('/owner/:utilityId',updateUtility);
router.get('/owner/update/:boardingId/:utilityType/:utilityId',getUpdateUtility);
router.delete('/owner/:utilityId',deleteUtility);
router.get(  '/owner/:ownerId',getUtilityBoarding);
router.get('/boarding/:boardingId',getOccupant);
router.get('/owner/:owneId/:facilities',getFacilitiesBoarding);
export default router;