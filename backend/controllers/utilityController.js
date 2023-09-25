import asyncHandler from 'express-async-handler';
import Utility from '../models/utilityModel.js';
import Boarding from '../models/boardingModel.js';
import User from '../models/userModel.js';
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
        occupantID,
     } = req.body;

    const boarding = await Boarding.findById(boardingId);
    const occupant = await User.findById(occupantID)

    const utility = await Utility.create({
       utilityType,
       amount,
       date,
       description,
       boarding,
       utilityImage,
       occupant,
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
        .populate('occupant')
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
    const occupantId = req.body.occupantID;
    const utilityType = req.params.utilityType;
    const page = req.body.page || 1;
    const searchQuery = req.body.searchQuery;
    const pageSize = 10
    const boardingId= req.body.boardingId;

    const skipCount = (page - 1) * pageSize;

    try{
        const utilities = await Utility.find({
            occupant: occupantId, 
            utilityType:utilityType,
            boarding:boardingId,
            description: { $regex: searchQuery, $options: 'i' }
        })
        .skip(skipCount)
        .limit(pageSize)


        const totalDescription =await Utility.countDocuments({
            boarding:boardingId,
            description: { $regex: searchQuery, $options: 'i' }
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

    const boardings = await Boarding.find({owner: ownerId});
    
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

    // Step 1: Get occupantIDs from Reservation table
    const reservations = await Reservation.find({ boardingId });

    if (!reservations || reservations.length === 0) {
        res.status(400).json({ message: 'No reservations found for this boardingId' });
        return;
    }

    // Extract occupantIDs from reservations
    const occupantIDs = reservations.map((reservation) => reservation.occupantID);

    // Step 2: Get occupants' names from User table
    const occupants = await User.find({ _id: { $in: occupantIDs } }, 'firstName');

    if (!occupants || occupants.length === 0) {
        res.status(400).json({ message: 'No occupants found for the given occupantIDs' });
        return;
    }

    res.status(200).json({
        occupants,
    });
});

export default getOccupant;
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
    // @desc    Get occupant name by occupantID
// route    GET /api/utilities/occupant/:occupantID
// @access  Private - Owner
const getOccupantName = asyncHandler(async (req, res) => {
    const occupantID = req.params.occupantID;

    try {
        // Step 1: Get occupant's name from User table using occupantID
        const occupant = await User.findById(occupantID);

        if (!occupant) {
            res.status(404).json({ message: 'Occupant not found' });
            return;
        }

        // Extract the occupant's name
        const occupantName = occupant.firstName;

        res.status(200).json({
            occupantName,
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

// @desc    Get all Utilities  
// route    POST /api/utilities/owner/report
const getUtilityReport = asyncHandler(async (req, res) => {
    const boardingId = req.body.boardingId;
    const page = req.body.page || 0;
    const pageSize = req.body.pageSize;
    const utilityType = req.body.UtilityType;
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const date = req.body.date;
    const search = req.body.search;
    const sortBy = req.body.sortBy;
    const order = req.body.order;
  
    endDate.setHours(23, 59, 59, 999);
  
    const skipCount = page * pageSize;
  
    let totalRows;
    let utility;
  

  
    if (utilityType == 'Electricity') {
        totalRows = await Utility.countDocuments({
            boarding:boardingId,
            utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" }  } : {}),
        });
  
        utility = await Utility.find({
            boarding:boardingId,
            utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" } } : {}),
        })
            .collation({ locale: "en" })
            .sort({ [sortBy]: order })
            .skip(skipCount)
            .limit(pageSize);
    } 
    
    if (utilityType == 'Water') {
        totalRows = await Utility.countDocuments({
            boarding:boardingId,
            utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" }  } : {}),
        });
  
        utility = await Utility.find({
            boarding:boardingId,
            utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" } } : {}),
        })
            .collation({ locale: "en" })
            .sort({ [sortBy]: order })
            .skip(skipCount)
            .limit(pageSize);
    } else {
        totalRows = await Utility.countDocuments({
          boarding:boardingId,
          utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" } } : {}),
        });
  
        utility = await Utility.find({
            boarding:boardingId,
            utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" } } : {}),
        })
            .collation({ locale: "en" })
            .sort({ [sortBy]: order })
            .skip(skipCount)
            .limit(pageSize);
    }
  
    if (utility) {
        res.status(200).json({
            utility,
            totalRows,
        });
    } else {
        res.status(400);
        throw new Error("No Utilities Available");
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
    getOccupantName,
    getUtilityReport,
};