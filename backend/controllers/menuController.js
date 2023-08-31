import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Menu from '../models/menuModel.js';


// @desc    Add a new Menu
// route    POST /api/menues/add
// @access  Private - Owner
const addMenu = asyncHandler(async (req, res) => {

    const {
        ownerId,
        menuName,
        cost,
        price,
        type 
    } = req.body;

    var menuExists = await Menu.findOne({ menuName: menuName, 'owner': ownerId });
    
    if(menuExists){
        res.status(400);
        throw new Error('Menu Already Exists');
    }

    const owner = await User.findById(ownerId);

    const menu = await Menu.create({
        menuName,
        cost,
        price,
        type,
        owner
    });

    if(menu){
        res.status(201).json({
            menu
        });
    }else{
        res.status(400);
        throw new Error('Invalid Menu Data');
    }

});


// @desc    Get all Menu of particular owner
// route    GET /api/menues/owner/:ownerId
// @access  Private - Owner
const getOwnerMenu = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId;

    const menu = await Menu.find({owner:ownerId});
    
    if(menu){
        res.status(200).json({
            menu,
        })
    }
    else{
        res.status(400);
        throw new Error("No Menu Available")
    }
});

// @desc    Update Menu of particular owner
// route    PUT /api/menues/owner
// @access  Private - Owner
const updateMenu = asyncHandler(async (req, res) => {
    const {
        ownerId,
        menuId,  
        newMenuName,
        newCost,
        newPrice,
        newPType
    } = req.body;

    try {
        const menu = await Menu.findOne({ _id: menuId, owner: ownerId });

        if (!menu) {
            res.status(404);
            throw new Error("Menu not found");
        }

        menu.menuName = newMenuName || menu.menuName;
        menu.cost = newCost || menu.cost;
        menu.price = newPrice || menu.price;
        menu.type = newPType || menu.type;

        const updatedMenu = await menu.save();

        res.status(200).json({
            updatedMenu
        });
    } catch (error) {
        res.status(400).json({
            error: error.message || "Failed to update Menu"
        });
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
