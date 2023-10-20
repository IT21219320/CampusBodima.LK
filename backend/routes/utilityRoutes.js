import express from 'express';
import { addUtilities, deleteUtility, getBoarding, getOccupant, getUtilityBoarding, getUtilitiesForBoarding, getUtilitiesForOccupant, updateUtility, getFacilitiesBoarding, getUpdateUtility, getOccupantName,getUtilityReport } from '../controllers/utilityController.js';


const router = express.Router();
router.post('/addUtility',addUtilities);
router.post('/owner/utilities',getUtilitiesForBoarding);
router.post('/occupants',getUtilitiesForOccupant);
router.post('/owner/report',getUtilityReport);
router.put('/owner/:utilityId',updateUtility);
router.get('/owner/update/:boardingId/:utilityType/:utilityId',getUpdateUtility);
router.delete('/owner/:utilityId',deleteUtility);
router.get(  '/owner/:ownerId',getUtilityBoarding);
router.get('/boarding/:boardingId',getOccupant);
router.get('/owner/:owneId/:facilities',getFacilitiesBoarding);
router.get('/utility/:ownerId',getBoarding);
router.get('/occupant/:occupantIDs',getOccupantName);
export default router;