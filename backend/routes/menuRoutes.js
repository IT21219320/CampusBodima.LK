import express from 'express';
import {addMenu,getOwnerMenu, getBoardingMenu, updateMenu, updateAvailability, deleteMenu} from '../controllers/menuController.js'; 

const router = express.Router();

router.post('/add', addMenu);
router.post('/ownerMenu', getOwnerMenu);
router.post('/boardingMenu', getBoardingMenu)
router.put('/owner', updateMenu);
router.put('/owner/availability', updateAvailability);
router.delete('/owner/deletemenu', deleteMenu);

export default router;