import express from 'express';
import {addMenu,getOwnerMenu,updateMenu,deleteMenu} from '../controllers/menuController.js'; 

const router = express.Router();

router.post('/add', addMenu);
router.post('/ownerMenu', getOwnerMenu);
router.put('/owner', updateMenu);
router.delete('/owner/deletemenu', deleteMenu);

export default router;