import express from 'express';
import {addMenu,getOwnerMenu,updateMenu,deleteMenu} from '../controllers/menuController.js'; 

const router = express.Router();

router.post('/add', addMenu);
router.get('/owner/:ownerId', getOwnerMenu);
router.put('/owner', updateMenu);
router.delete('/owner/:ownerId/:menuId', deleteMenu);

export default router;