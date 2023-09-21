import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Boarding from '../models/boardingModel.js';
import Ingredient from '../models/ingredientModel.js';
import IngredientHistory from '../models/ingredientHistoryModel.js';


// @desc    Add a new Ingredient
// route    POST /api/ingredient/add
// @access  Private - Owner
const addIngredient = asyncHandler(async (req, res) => {

    const {
        boardingId,
        ingredientName,
        quantity,
        measurement,
        purchaseDate 
    } = req.body;

    var ingredientExists = await Ingredient.findOne({ ingredientName: ingredientName, 'boarding': boardingId });
    
    if(ingredientExists){
        res.status(400);
        throw new Error('Ingredient Already Exists');
    }

    const boarding = await Boarding.findById(boardingId);

    const ingredient = await Ingredient.create({
        ingredientName,
        quantity,
        measurement,
        purchaseDate,
        boarding
    });

    if(ingredient){

        await IngredientHistory.create({
            ingredientName,
            quantity,
            purchaseDate,
            type: 'Purchase',  
            boarding: boardingId,
        });

        res.status(201).json({
            ingredient
        });
    }else{
        res.status(400);
        throw new Error('Invalid Ingredient Data');
    }

});


// @desc    Get all Ingredient for particular boarding
// route    GET /api/ingredient/owner/:boardingId/:page
// @access  Private - Owner
const getBoardingIngredient = asyncHandler(async (req, res) => {
    const boardingId = req.body.boardingId;
    const page = req.body.pageNo || 1;
    const searchQuery = req.body.searchQuery;
    const pageSize = 10;

    const skipCount = (page - 1) * pageSize;

    var totalPages = await Ingredient.countDocuments({
        boarding:boardingId,
        ingredientName: {$regex: searchQuery, $options: 'i'}
    });
    totalPages = Math.ceil(parseInt(totalPages)/pageSize);

    const ingredient = await Ingredient.find({
        boarding:boardingId,
        ingredientName: {$regex: searchQuery, $options: 'i'}
    }).skip(skipCount).limit(pageSize);
    
    if(ingredient){
        res.status(200).json({
            ingredient,
            totalPages
        })
    }
    else{
        res.status(400);
        throw new Error("No Ingredient Available")
    }
});

// @desc    Search all Ingredient for Ingredient Name 
// route    GET /api/ingredient/owner/:boardingId/:page
// @access  Private - Owner
/*const searchIngredient = asyncHandler(async (req, res) => {
    const { boardingId } = req.params;
    const { ingredientName } = req.query; // ingredientName from query parameters

    const ingredient = await Ingredient.findOne({
        boarding: boardingId,
        ingredientName: ingredientName,
    });

    if (ingredient) {
        res.status(200).json({
            ingredient,
        });
    } else {
        res.status(404);
        throw new Error('Ingredient not found');
    }
});*/

 
// @desc    Get all Boardings of particular owner if they selected Food
// route    GET /api/ingredient/owner/:ownerId
// @access  Private - Owner
const getOwnerBoarding = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId;
    
    const boardings = await Boarding.find({ owner: ownerId, food: true });
    
    if(boardings){
        res.status(200).json({
            boardings, 
        })
    }
    else{
        res.status(400);
        throw new Error("No Boardings Available")
    }
});

// @desc    Get Ingredients for Update
// route    GET /api/ingredient/owner/update/:boardingId/:ingredientId
// @access  Private - Owner
const getUpdateIngredients = asyncHandler(async (req, res) => {
    const boardingId = req.params.boardingId;
    const ingredientId = req.params.ingredientId;
  
    try {
      const ingredient = await Ingredient.findOne({
        _id: ingredientId,
        boarding: boardingId,
      });
  
      if (ingredient) {
         
        const boarding = await Boarding.findById(boardingId);
  
        if (boarding) {
          res.status(200).json({
            ingredient,
            boarding,
          });
        } else {
          res.status(404);
          throw new Error("Boarding not found");
        }
      } else {
        res.status(404);
        throw new Error("Ingredient not found");
      }
    } catch (error) {
      res.status(500).json({
        message: error.message || "Server error while fetching ingredient",
      });
    }
  });


// @desc    Update ingredient of particular boarding
// route    PUT /api/ingredient/owner
// @access  Private - Owner
const updateIngredient = asyncHandler(async (req, res) => {
    const {
        boardingId,
        ingredientId,  
        newIngredientName,
        newQuantity,
        newMeasurement,
        newPurchaseDate
    } = req.body;

    try {
        const ingredient = await Ingredient.findOne({ _id: ingredientId, boarding:boardingId });

        if (!ingredient) {
            res.status(404);
            throw new Error("Ingredient not found");
        }

        ingredient.ingredientName = newIngredientName || ingredient.ingredientName;
        ingredient.quantity = newQuantity || ingredient.quantity;
        ingredient.measurement = newMeasurement || ingredient.measurement;
        ingredient.purchaseDate = newPurchaseDate || ingredient.purchaseDate;

        const updatedIngredient = await ingredient.save();

        res.status(200).json({
            updatedIngredient
        });
    } catch (error) {
        res.status(400).json({
            error: error.message || "Failed to update Ingredient"
        });
    }
});


// @desc    Delete Ingredient of particular boarding
// route    DELETE /api/ingredient/owner/:boardingId/:ingredientId
// @access  Private - Owner
const deleteIngredient = asyncHandler(async (req, res) => {
    const boardingId = req.params.boardingId;
    const ingredientId = req.params.ingredientId;  

    try {
        const result = await Ingredient.deleteOne({ _id: ingredientId, boarding:boardingId });

        if (result.deletedCount === 0) {
            res.status(404);
            throw new Error("Ingredient not found");
        }

        res.status(200).json({
            message: "Ingredient deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            error: error.message || "Failed to delete ingredient"
        });
    }
});


export { 
    addIngredient,
    getBoardingIngredient,
    getOwnerBoarding,
    updateIngredient,
    getUpdateIngredients,
    deleteIngredient    
};