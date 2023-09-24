import asyncHandler from 'express-async-handler';
import Utility from '../models/utilityModel.js';
import Boarding from '../models/boardingModel.js';
import Occupants from '../models/reservationModel.js';
import Reservation from '../models/reservationModel.js';


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
    const boardingId = req.body. boardingId;
    const utilityType = req.body.utilityType;
    const page = req.body.page || 1;
    const searchQuery = req.body.searchQuery;
    const pageSize = 10
    
    const skipCount = (page - 1) * pageSize;

    try{
        const utilities = await Utility.find({
            boarding:boardingId,
            utilityType:utilityType,
            description: { $regex: searchQuery, $options: 'i' }
        })
        .skip(skipCount)
        .limit(pageSize)


        const totalDescription =await Utility.countDocuments({
            boarding:boardingId,
            descrotion: { $regex: searchQuery, $options: 'i' }
        })

        const  totalPages = Math.ceil(parseInt(totalDescription)/pageSize);
            
        res.status(200).json({
            utility:utilities,
            totalPages:totalPages,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// @desc    Get all Utilities for a boarding
// route    GET /api/utilities/occupants/:occupantId/:boardingId/:utilityType'
// @access  Private - Occupant
const getUtilitiesForOccupant = asyncHandler (async(req, res) => {
    const occupantId = req.body.occupantId;
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
// @desc    Get Utilities for Update
// route    GET /api/utilities/owner/update/:boardingId/:utilityType/:utilityId
// @access  Private - Owner
const getUpdateUtility = asyncHandler(async (req, res) => {
    const boardingId = req.params.boardingId;
    const utilityType = req.params.utilityType;
    const utilityId=req.params.utilityId;
  
    try {
      const utility = await Utility.findOne({
        _id:utilityId,
        boarding: boardingId,
        utilityType:utilityType,
      });
  
      if (utility) {
         
        const boarding = await Boarding.findById(boardingId);
  
        if (boarding) {
          res.status(200).json({
            utility,
            boarding,
          });
        } else {
          res.status(404);
          throw new Error("Boarding not found");
        }
      } else {
        res.status(404);
        throw new Error("Utility not found");
      }
    } catch (error) {
      res.status(500).json({
        message: error.message || "Server error while fetching utility",
      });
    }
  });

// @desc    delete utilitybill for a bording 
// route    DELETE /api/utilities/owner/:boardingId/:utilityType/ :utilityId
// @access  Private - Owner
const deleteUtility = asyncHandler(async (req, res) => {
    
    const utilityId = req.params.utilityId; 
    

    try {
        const utility = await Utility.findOneAndDelete({  _id:utilityId });

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
 // @desc    Get all Boardings of particular owner for utilities
// route    GET /api/utilities/owner/:ownerId
// @access  Private - Owner
const getBoarding = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId;

    const boardings = await Boarding.find({owner:ownerId});
    
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
// @desc    Get all Boardings of particular owner if they selected UtilityBills
// route    GET /api/utilities/owner/:ownerId
// @access  Private - Owner
const getUtilityBoarding = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId;
    
    const boardings = await Boarding.find({ owner: ownerId, utilityBills: true });
    
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
// @desc    Get all occupants  for boarding
// route    GET /api/utilities/boarding/:boardingId
// @access  Private - Owner
const getOccupant = asyncHandler(async (req, res) => {
    const boardingId = req.params.boardingId;

    const occupant = await users.find({boardingId:boardingId,userType:"occupant"});
    
    if(occupant){
        res.status(200).json({
           occupant,
        })
    }
    else{
        res.status(400);
        throw new Error("No occupants")
    }
});
// @desc    Get all Boardings of a particular owner if they selected facilities
// route    GET /api/utilities/owner/:ownerId/:facilities
// @access  Private - Owner
const getFacilitiesBoarding = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId;
    const selectedFacilities = req.query.facilities; // Assuming you pass selected facilities as query parameters

    try {
        // Find the owner by ID
        const owner = await User.findById(ownerId);

        if (!owner) {
            res.status(404);
            throw new Error("Owner not found");
        }

        // Filter the owner's boardings based on selected facilities
        const boardings = owner.boardings.filter((boarding) =>
            boarding.facilities.some((facilities) => selectedFacilities.includes(facilities))
        );

        if (boardings.length > 0) {
            res.status(200).json({
                boardings,
            });
        } else {
            res.status(404);
            throw new Error("No boardings matching the selected facilities");
        }
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});
export{
    addUtilities,
    getUtilitiesForBoarding,
    getUtilitiesForOccupant,
    updateUtility,
    getUpdateUtility,
    deleteUtility,
    getBoarding,
    getUtilityBoarding,
    getOccupant,
    getFacilitiesBoarding,
};