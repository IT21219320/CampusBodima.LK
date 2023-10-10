import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Menu from '../models/menuModel.js';


const addMenu = async (req, res) => {
    try {
      const {
        menuName,
        product,
        boarding,
        cost,
        foodType,
        price,
        ownerId,
        //foodImages,
      } = req.body;
      
      const menu = new Menu({
        menuName:menuName,
        product:product,
        boarding:boarding,
        foodType:foodType,
        price:price,
        cost:cost,
        //foodImages:foodImages,
        owner:ownerId,
      });
  
      await menu.save();
  
      res.status(201).json(menu);
    } catch (error) {
      res.status(500).json({ error: "Could not create the Menu" });
    }
  };
  



const getOwnerMenu = asyncHandler(async (req, res) => {
    
    const ownerId = req.body.ownerId;
   
  
  try {
      const menu = await Menu.find({owner:ownerId});

      if (menu) {
          res.status(200).json({
            menu,
          });
      } else {
          res.status(404).json({
              message: "No Menu Available",
          });
      }
  } catch (error) {
      res.status(500).json({
          message: "Server error",
      });
  }
});

// @desc    Update Menu of particular owner
// route    PUT /api/menues/owner
// @access  Private - Owner
const updateMenu = asyncHandler(async (req, res) => {
    const menu = await Menu.findOne({_id:req.body._id});    
    if (menu) {
      
      menu.product = req.body.product||menu.product;
      menu.boarding = req.body.boarding||menu.boarding;
      menu.foodType = req.body.foodType||menu.foodType;
      menu.price = req.body.price||menu.price;
      menu.date = req.body.date||menu.date;
      
      const updateMenu = await menu.save();

    res.status(200).json({
      _id:updateMenu._id,
      product:updateMenu.product,
      foodType:updateMenu.foodType,
      price:updateMenu.price,
      date:updateMenu.date,
    });
    }else{
      res.status(404);
      throw new Error('Menu not found');
     }
});

// @desc    Delete Menu of particular owner
// route    DELETE /api/menues/owner/:ownerId/:menuId
// @access  Private - Owner
const deleteMenu = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId;
    const menuId = req.params.menuId;  

    try {
        const result = await Menu.deleteOne({ _id: menuId, owner: ownerId });

        if (result.deletedCount === 0) {
            res.status(404);
            throw new Error("Menu not found");
        }

        res.status(200).json({
            message: "Menu deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            error: error.message || "Failed to delete Menu"
        });
    }
});

export { 
    addMenu,
    getOwnerMenu,
    updateMenu,
    deleteMenu    
};
