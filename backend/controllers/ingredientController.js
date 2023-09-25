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

    try {
        // Query to find ingredients based on boardingId and ingredientName, sorted alphabetically
        const ingredients = await Ingredient.find({
            boarding: boardingId,
            ingredientName: { $regex: searchQuery, $options: 'i' } // Case-insensitive search
        })
        .sort({ ingredientName: 1 }) // Sort in ascending alphabetical order by ingredientName
        .skip(skipCount)
        .limit(pageSize);

        // Query to count the total number of matching ingredients
        const totalIngredientsCount = await Ingredient.countDocuments({
            boarding: boardingId,
            ingredientName: { $regex: searchQuery, $options: 'i' } // Case-insensitive search
        });

        const totalPages = Math.ceil(totalIngredientsCount / pageSize);

        res.status(200).json({
            ingredient: ingredients,
            totalPages: totalPages
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Search all Ingredient for Ingredient Name 
// route    Post /api/ingredient/owner/ingredients/name
// @access  Private - Owner
const getBoardingIngredientNames = asyncHandler(async (req, res) => {
    const boardingId = req.body.boardingId;
    const searchQuery = req.body.searchQuery;
    
    try {
        // Query to find ingredients based on boardingId and ingredientName, sorted alphabetically
        const ingredients = await Ingredient.find({
            boarding: boardingId,
            ingredientName: { $regex: searchQuery, $options: 'i' } // Case-insensitive search
        })
        .sort({ ingredientName: 1 }) // Sort in ascending alphabetical order by ingredientName
         
        res.status(200).json({
            ingredient: ingredients,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


 
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

        // Store the original ingredientName for updating IngredientHistory
        const originalIngredientName = ingredient.ingredientName;


        ingredient.ingredientName = newIngredientName || ingredient.ingredientName;
        ingredient.quantity = newQuantity || ingredient.quantity;
        ingredient.measurement = newMeasurement || ingredient.measurement;
        ingredient.purchaseDate = newPurchaseDate || ingredient.purchaseDate;

        const updatedIngredient = await ingredient.save();

         // Update all matching entries in IngredientHistory
         await IngredientHistory.updateMany(
          { ingredientName: originalIngredientName, boarding: boardingId },
          { ingredientName: updatedIngredient.ingredientName }
        );

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

// @desc    Increase ingredient quantity
// route    POST /api/ingredient/owner/ingredients/increase
// @access  Private - Owner
const increaseIngredientQuantity = asyncHandler(async (req, res) => {
  const {
    boardingId,
    ingredientId,
    quantity,
    purchaseDate,
  } = req.body;

  try {
    // Find the ingredient by ID and boarding ID
    const ingredient = await Ingredient.findOne({ _id: ingredientId, boarding: boardingId });

    if (!ingredient) {
      res.status(404);
      throw new Error('Ingredient not found');
    }

    const match = quantity.match(/\d+/);

    if (match) {
    // Convert the matched value to a number
    const quantityNum = parseFloat(match[0]);

     
    // Extract the numeric value from ingredient quantity
    const ingredientQuantityMatch = ingredient.quantity.match(/\d+/);

    // Check if a match was found
    if (ingredientQuantityMatch) {
    // Convert the matched value to a number
    const ingredientQuantityNum = parseFloat(ingredientQuantityMatch[0]);

    // Add the numeric values
    const sum = ingredientQuantityNum + quantityNum;

    // Convert the sum back to a string
    const newIngredientQuantity = sum.toString() + ingredient.quantity.replace(/\d+/, '');

    ingredient.quantity = newIngredientQuantity;
  } else {
  console.log("No numeric value found in ingredient quantity.");
  }
  } else {
  console.log("No numeric value found in quantity.");
  }

    // Update the purchase date
    ingredient.purchaseDate = purchaseDate;
 
    await ingredient.save();

    // Concatenate the quantityNum with ingredient.quantity
    const quantityNum = parseFloat(match[0]);
    const updatedIngredientQuantity = quantityNum.toString() + ingredient.quantity.replace(/\d+/, '');


    // Create a new entry in IngredientHistory
    await IngredientHistory.create({
    ingredientName: ingredient.ingredientName,
    quantity: updatedIngredientQuantity,  
    purchaseDate: purchaseDate,  
    type: 'Purchase',  
    boarding: boardingId,
  });

    res.status(201).json({
      ingredient 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to increase ingredient quantity', error: error.message });
  }
});

// @desc    Increase ingredient quantity
// route    POST /api/ingredient/owner/ingredients/reduce
// @access  Private - Owner
const reduceIngredientQuantity = asyncHandler(async (req, res) => {
  const {
    boardingId,
    ingredientId,
    quantity,
    purchaseDate,
  } = req.body;

  try {
    // Find the ingredient by ID and boarding ID
    const ingredient = await Ingredient.findOne({ _id: ingredientId, boarding: boardingId });
    let alertQty = false;
    let alertQtyName;

    if (!ingredient) {
      res.status(404);
      throw new Error('Ingredient not found');
    }

    const match = quantity.match(/\d+/);

    if (match) {

      const quantityNum = parseFloat(match[0]);

      const ingredientQuantityMatch = ingredient.quantity.match(/\d+/);

      if (ingredientQuantityMatch) {
        const ingredientQuantityNum = parseFloat(ingredientQuantityMatch[0]);

        const result = ingredientQuantityNum - quantityNum;

        
        const match1 = ingredient.measurement.match(/\d+/);

        if (match1) {
          const alertQuantity = parseFloat(match1[0]);
          
          // Update the ingredient quantity in the database
          const newIngredientQuantity = result.toString() + ingredient.quantity.replace(/\d+/, '');
          ingredient.quantity = newIngredientQuantity;

          if (result < alertQuantity) {
            // Display the toast message if result < alertQuantity
            alertQty = true;
            alertQtyName = ingredient.ingredientName;
          }
          // Save the updated ingredient quantity
          if (result < 0) {
            res.status(400);
            throw new Error('Cannot reduce quantity below zero');
          }
          await ingredient.save();


          // Concatenate the quantityNum with ingredient.quantity
          const quantityNum = parseFloat(match[0]);
          const updatedIngredientQuantity = quantityNum.toString() + ingredient.quantity.replace(/\d+/, '');

          await IngredientHistory.create({
            ingredientName: ingredient.ingredientName,
            quantity: updatedIngredientQuantity,  
            purchaseDate: purchaseDate,  
            type: 'Reduce',  
            boarding: boardingId,
          });
          
        }
      }
    }  


    console.log('dfdf');

    res.status(201).json({
      ingredient,
      alertQty,
      alertQtyName
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reduce ingredient quantity', error: error.message });
  }
});

// @desc    Get all Ingredient in IngredientHistory table
// route    POST /api/ingredient/owner/history
const getIngredientHistoy = asyncHandler(async (req, res) => {
  const boardingId = req.body.boardingId;
  const page = req.body.page || 0;
  const pageSize = req.body.pageSize;
  const type = req.body.type;
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const date = req.body.date;
  const search = req.body.search;
  const sortBy = req.body.sortBy;
  const order = req.body.order;

  endDate.setHours(23, 59, 59, 999);

  const skipCount = page * pageSize;

  let totalRows;
  let ingredientHistory;

  console.log(type);
  console.log(date);
  console.log(boardingId);

  if (type == 'Purchase') {
      totalRows = await IngredientHistory.countDocuments({
          boarding:boardingId,
          type,
          ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
          ...(search ? { ingredientName: { $regex: search, $options: "i" }  } : {}),
      });

      ingredientHistory = await IngredientHistory.find({
          boarding:boardingId,
          type,
          ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
          ...(search ? { ingredientName: { $regex: search, $options: "i" } } : {}),
      })
          .collation({ locale: "en" })
          .sort({ [sortBy]: order })
          .skip(skipCount)
          .limit(pageSize);
  } else {
      totalRows = await IngredientHistory.countDocuments({
        boarding:boardingId,
          type,
          ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
          ...(search ? { ingredientName: { $regex: search, $options: "i" } } : {}),
      });

      ingredientHistory = await IngredientHistory.find({
          boarding:boardingId,
          type,
          ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
          ...(search ? { ingredientName: { $regex: search, $options: "i" } } : {}),
      })
          .collation({ locale: "en" })
          .sort({ [sortBy]: order })
          .skip(skipCount)
          .limit(pageSize);
  }

  if (ingredientHistory) {
      res.status(200).json({
          ingredientHistory,
          totalRows,
      });
  } else {
      res.status(400);
      throw new Error("No Ingredient History Available");
  }
});



export { 
    addIngredient,
    getBoardingIngredient,
    getBoardingIngredientNames,
    getOwnerBoarding,
    updateIngredient,
    getUpdateIngredients,
    deleteIngredient,
    increaseIngredientQuantity,
    reduceIngredientQuantity,
    getIngredientHistoy    
};