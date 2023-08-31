import asyncHandler from 'express-async-handler';
import Utility from '../models/utilityModel.js';
import Boarding from '../models/boardingModel.js';


// @desc    Add utilities
// route    POST /api/utilities/addUtility
// @access  Private - Owner
const addUtilities = asyncHandler(async (req, res) => {

    const{
        boardingId,
        utilityType,
        amount,
        date,
        description,
        utilityImage,
     } = req.body;

    const boarding = await Boarding.findById(boardingId);

    const utility = await Utility.create({
       utilityType,
       amount,
       date,
       description,
       boarding,
       utilityImage,
    });

    if(utility){
        res.status(201).json({
            utility
        });
    }else{
        res.status(400);
        throw new Error('Invalid Utility Data');
    }

});


// @desc    Get all Utilities particular boarding
// route    GET /api/utilities/owner/:boardingId/:utilityType
// @access  Private - Owner

const getUtilitiesForBoarding = asyncHandler(async (req, res) =>{
    const boardingId = req.params. boardingId;
    const utilityType = req.params.utilityType;

    const utilities = await Utility.find({boarding:boardingId, utilityType:utilityType});
    
    if(utilities){
        res.status(200).json({
            utilities,
        })
    }
    else{
        res.status(400);
        throw new Error("No Utilities")
    }
});


// @desc    Get all Utilities for a boarding
// route    GET /api/utilities/occupants/:occupantId/:boardingId/:utilityType'
// @access  Private - Occupant
const getUtilitiesForOccupant = asyncHandler (async(req, res) => {
    const occupantId = req.params.occupantId;
    const boardingId = req.params.boardingId;
    const utilityType = req.params.utilityType;
    
    const utilities = await Utility.find( {
        boarding:boardingId ,
        occupantID: occupantId , 
        utilityType:utilityType});

    if(utilities){
        res.status(200).json({
            utilities,
        })
    }
    else{
        res.status(400);
        throw new Error("No Utilities")
    }
});
// @desc    Update utilities for a owner
// route    PUT /api/utilities/owner/:boardingId/:utillityType/:utilityId
// @access  Private - Owner

const updateUtility = asyncHandler(async (req, res) => {
    
    const { boardingId,utilityType,utilityId,newAmount, newDate, newDescription, newUtilityImage } = req.body;

    try {
        const utility = await Utility.findOne({boarding:boardingId,utilityType:utilityType, _id:utilityId});
        if (!utility) {
            res.status(404);
            throw new Error( 'Utility not found' );
        }

        utility.amount = newAmount || utility.amount ;
        utility.date = newDate || utility.date;
        utility.description = newDescription || utility.description;
        utility.utilityImage = newUtilityImage || utility.utilityImage;

        const updatedUtility = await utility.save();

        res.status(200).json({updatedUtility});
    } catch (error) {
        res.status(400).json({
            error: error.message || "Failed to update Utilities"
        });

    }
});

// @desc    delete utilitybill for a bording 
// route    DELETE /api/utilities/owner/:boardingId/:utilityType/ :utilityId
// @access  Private - Owner
const deleteUtility = asyncHandler(async (req, res) => {
    const boardingId = req.params.boardingId;
    const utilityId = req.params.utilityId;
    const utilityType = req.params.utilityType;  

    try {
        const utility = await Utility.findOneAndDelete({ boarding:boardingId ,utilityType:utilityType, _id:utilityId });

        if (!utility) {
            res.status(404);
            throw new Error("Utility  not found");
        }

        res.status(200).json({
            message: " Utility deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            error: error.message || "Failed to delete utility"
        });
    }
});

export{
    addUtilities,
    getUtilitiesForBoarding,
    getUtilitiesForOccupant,
    updateUtility,
    deleteUtility,
};