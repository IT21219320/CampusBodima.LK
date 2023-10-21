import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Menu from '../models/menuModel.js';
import Boarding from '../models/boardingModel.js';
import Reservation from '../models/reservationModel.js';


const addMenu = asyncHandler(async (req, res) => {
  const {
    product,
    boarding,
    price,
    ownerId,
    foodImage,
  } = req.body;


  const existingItem = await Menu.findOne({ boarding, owner: ownerId, product: product });
  console.log(existingItem);

  if (existingItem) {
    res.status(400);
    throw new Error("You can't enter same product two times!!");
  } else {

    const menu = await Menu.create({
      product: product,
      boarding: boarding,
      price: price,
      foodImage: foodImage,
      owner: ownerId,
    });
    res.status(201).json(menu);
  }

});


const getOwnerMenu = asyncHandler(async (req, res) => {

  const ownerId = req.body.ownerId;

  //const .. ..df= ..d
  let boardingId = req.body.boardingId;
  console.log(boardingId);
  if (!boardingId) {
    boardingId = await Boarding.findOne({ inventoryManager: ownerId });
    if(!boardingId){
      throw new Error("You are not assigned to a boarding")
    }
    boardingId = boardingId._id.toString();
  }


  //1.const boarding = get boardings that has inventoryManager as ownerId
  const boarding = await Boarding.find({ inventoryManager: ownerId }).select('boardingName');
  //if(boarding.lenght > 0){}else{thrw err no assigned boardings}

  if (boarding.length > 0) {
    try {
      const menu = await Menu.find({ owner: ownerId, boarding: boardingId });
      if (menu) {
        res.status(200).json({
          menu,
          boarding,
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
  } else {
    throw new Error("Sorry, No boardings assigned to you!!");
  }

  //if(bid == ''){}



});


const getBoardingMenu = asyncHandler(async (req, res) => {

  const userId = req.body.userID;

  const reservation = await Reservation.findOne({occupantID: userId})
  if (reservation) {
    
    const boarding = await Boarding.findOne({_id: reservation.boardingId, food: true})
    
    if(!boarding){
      res.status(400)
      throw new Error("Your boarding does not proved this facility")
    }
    try {
      const menu = await Menu.find({ boarding: reservation.boardingId });
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
  } else {
    throw new Error("Sorry, you dont have a reservation!!");
  }



});

// @desc    Update Menu of particular owner
// route    PUT /api/menues/owner
// @access  Private - Owner
const updateMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ _id: req.body._id });
  if (menu) {
    menu.price = req.body.price || menu.price;
    menu.product = req.body.product || menu.product;

    const updateMenu = await menu.save();

    res.status(200).json({

      updateMenu

    });
  } else {
    res.status(404);
    throw new Error('Menu not found');
  }
});

// @desc    Delete Menu of particular owner
// route    DELETE /api/menues/owner/:ownerId/:menuId
// @access  Private - Owner
const deleteMenu = asyncHandler(async (req, res) => {
  const menuId = req.body._id;
  console.log(menuId);
  try {
    const menu = await Menu.findById(menuId);

    if (!menu) {
      res.status(404);
      throw new Error("Item not found");
    }

    await Menu.deleteOne({ _id: menuId });
    res.status(200).json({
      message: "Menu Item deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete Menu Item",
      error: error.message
    });
  }
});

export {
  addMenu,
  getOwnerMenu,
  getBoardingMenu,
  updateMenu,
  deleteMenu
};
