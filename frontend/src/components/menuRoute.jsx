import express from 'express';
const router =express.Router();
import Menu from'../frontend/src/pages/Menu.jsx';

router.get('/', async (req, res) => {
    try {
        const menus = await Menu.find();
        res.json(menus);
    }
    catch (error){
        res.status(500).json({message: 'Server Error'});
    }
});

router.post('/', async (req, res) => {
    const { name, description, price } = req.body;
    try{
        const menu = new Menu({name, description,price});
        await menu.save();
        res.status(201).json(menu);
    }
    catch(error){
        res.status(500).json({message: 'Server Error'});
    }
});