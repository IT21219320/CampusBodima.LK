import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Ingredient from '../models/ingredientModel.js';


// @desc    Add a new Ingredient
// route    POST /api/ingredient/add
// @access  Private - Owner
const addIngredient = asyncHandler(async (req, res) => {

    const {
        ownerId,
        ingredientName,
        quantity,
        measurement,
        purchaseDate 
    } = req.body;

    var ingredientExists = await Ingredient.findOne({ ingredientName: ingredientName, 'owner': ownerId });
    
    if(ingredientExists){
        res.status(400);
        throw new Error('Ingredient Already Exists');
    }

    const owner = await User.findById(ownerId);

    const ingredient = await Ingredient.create({
        ingredientName,
        quantity,
        measurement,
        purchaseDate,
        owner
    });

    if(ingredient){
        res.status(201).json({
            ingredient
        });
    }else{
        res.status(400);
        throw new Error('Invalid Ingredient Data');
    }

});


// @desc    Get all Ingredient of particular owner
// route    GET /api/ingredient/owner/:ownerId/:page
// @access  Private - Owner
const getOwnerIngredient = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId;
    const page = req.params.page || 1;
    const pageSize = 10;

    const skipCount = (page - 1) * pageSize;

    var totalPages = await Ingredient.countDocuments({owner:ownerId});
    totalPages = Math.ceil(parseInt(totalPages)/pageSize);

    const ingredient = await Ingredient.find({owner:ownerId}).skip(skipCount).limit(pageSize);
    
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


// @desc    Update ingredient of particular owner
// route    PUT /api/ingredient/owner
// @access  Private - Owner
const updateIngredient = asyncHandler(async (req, res) => {
    const {
        ownerId,
        ingredientId,  
        newIngredientName,
        newQuantity,
        newMeasurement,
        newPurchaseDate
    } = req.body;

    try {
        const ingredient = await Ingredient.findOne({ _id: ingredientId, owner: ownerId });

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


// @desc    Delete Ingredient of particular owner
// route    DELETE /api/ingredient/owner/:ownerId/:ingredientId
// @access  Private - Owner
const deleteIngredient = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId;
    const ingredientId = req.params.ingredientId;  

    try {
        const result = await Ingredient.deleteOne({ _id: ingredientId, owner: ownerId });

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
    getOwnerIngredient,
    updateIngredient,
    deleteIngredient    
};