import asyncHandler from 'express-async-handler';
import Utility from '../models/utilityModel.js';
import Boarding from '../models/boardingModel.js';
import User from '../models/userModel.js';
import Reservation from '../models/reservationModel.js';
import { sendMail } from '../utils/mailer.js'


// @desc    Add utilities
// route    POST /api/utilities/addUtility
// @access  Private - Owner
const addUtilities = asyncHandler(async (req, res) => {
    const {
        boardingId,
        utilityType,
        amount,
        month,
        description,
        utilityImage,
        occupantIDs,
        perCost,
    } = req.body;

    const boarding = await Boarding.findById(boardingId);
    const occupants = await User.find({ _id: { $in: occupantIDs } });

    const utility = await Utility.create({
        utilityType,
        amount,
        month,
        description,
        boarding,
        utilityImage,
        occupant: occupants,
        perCost,
    });

    if (utility) {
        // Send email to each occupant with per occupant cost
        for (const occupant of occupants) {
            if (occupant.email) { // Check if the occupant has an email
                const message = `<p>Dear ${occupant.firstName},</p>
                    <p>A new utility cost has been added for your boarding at ${boarding.boardingName}:</p>
                    <p><b>Utility Type:</b> ${utilityType}</p>
                    <p><b>Amount:</b> Rs. ${amount}</p>
                    <p><b>Month:</b> ${month}</p>
                    <p><b>Description:</b> ${description}</p>
                    <p><b>Per Occupant Cost:</b> Rs. ${perCost}</p>
                    <p>For any inquiries or concerns, please contact owner.</p>
                    <p>Best regards,<br>
                    The Campus Bodim Team</p>`;

                try {
                    await sendMail(occupant.email, message, `New Utility Cost at ${boarding.boardingName}`);
                    console.log(`Email sent to ${occupant.email}`);
                } catch (error) {
                    console.error(`Error sending email to ${occupant.email}: ${error}`);
                }
            }
        }

        res.status(201).json({
            utility
        });
    } else {
        res.status(400);
        throw new Error('Invalid Utility Data');
    }
});




// @desc    Get all Utilities particular boarding
// route    GET /api/utilities/owner/:boardingId/:utilityType
// @access  Private - Owner


const getUtilitiesForBoarding = asyncHandler(async (req, res) =>{
    const boardingId = req.body.boardingId;
    const utilityType = req.body.utilityType;
    const occupant = req.body.occupant; // Add this line to get occupantId
    const page = req.body.page || 1;
    const searchQuery = req.body.searchQuery;
    const pageSize = 10
    
    const skipCount = (page - 1) * pageSize;

    try {
        const utilityQuery = {
            boarding: boardingId,
            utilityType: utilityType,
            description: { $regex: searchQuery, $options: 'i' }
        };

        // Check if occupantId is provided and add it to the query
        if (occupant) {
            utilityQuery.occupant = occupant;
        }

        const utilities = await Utility.find(utilityQuery)
            .populate('occupant')
            .skip(skipCount)
            .limit(pageSize);

        const totalDescription = await Utility.countDocuments(utilityQuery);

        const totalPages = Math.ceil(parseInt(totalDescription) / pageSize);
            
        res.status(200).json({
            utility: utilities,
            totalPages: totalPages,
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
    const utilityType = req.body.utilityType;
    const page = req.body.pageNo || 1;
    const searchQuery = req.body.searchQuery;
    const pageSize = 10
    const boardingId= req.body.boardingId;

    const skipCount = (page - 1) * pageSize;

    console.log(utilityType);

    try{
        const utilities = await Utility.find({
            occupant:occupantId, 
            utilityType:utilityType,
            description: { $regex: searchQuery, $options: 'i' }
        })
        .skip(skipCount)
        .limit(pageSize)


        const totalDescription =await Utility.countDocuments({
            occupant: occupantId,
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
    const {
        boardingId,
        utilityType,
        utilityId,
        newAmount,
        newMonth,
        newDescription,
        newUtilityImage,
        newOccupant,
        newPerCost,
    } = req.body;

    try {
        const utility = await Utility.findOne({ boarding: boardingId, utilityType, _id: utilityId });
        if (!utility) {
            res.status(404);
            throw new Error('Utility not found');
        }

        const originalAmount = utility.amount;
        utility.amount = newAmount || utility.amount;
        utility.month = newMonth || utility.month;
        utility.description = newDescription || utility.description;
        utility.utilityImage = newUtilityImage || utility.utilityImage;
        utility.occupant = newOccupant || utility.occupant;
        utility.perCost = newPerCost || utility.perCost;

        const updatedUtility = await utility.save();

        // Calculate the change in amount
        const amountChange = updatedUtility.amount - originalAmount;

        // If there is a change in amount and occupants are selected
        if (amountChange !== 0 && updatedUtility.occupant.length > 0) {
            // Send email to selected occupants with the per cost
            for (const occupantId of updatedUtility.occupant) {
                const occupant = await User.findById(occupantId);
                const boardings = await Boarding.findById(boardingId);
                if (occupant.email) {

                    const message = `<p>Dear ${occupant.firstName},</p>
                        <p>The utility cost for your boarding at ${boardings.boardingName} has been updated:</p>
                        <p><b>Utility Type:</b> ${updatedUtility.utilityType}</p>
                        <p><b>New Amount:</b> Rs. ${updatedUtility.amount}</p>
                        <p><b>Month:</b> ${updatedUtility.month}</p>
                        <p><b>Description:</b> ${updatedUtility.description}</p>
                        <p><b>Per Occupant Cost:</b> Rs. ${updatedUtility.perCost}</p>
                        <p>For any inquiries or concerns, please contact owner.</p>
                        <p>Best regards,<br>
                        The Campus Bodim Team</p>`;

                    try {
                        sendMail(occupant.email, message, `Updated Utility Cost at ${boardings.boardingName}`);
                        console.log(`Email sent to ${occupant.email}`);
                    } catch (error) {
                        console.error(`Error sending email to ${occupant.email}: ${error}`);
                    }
                }
            }
        }

        res.status(200).json({ updatedUtility });
    } catch (error) {
        res.status(400).json({
            error: error.message || 'Failed to update Utilities',
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
      }).populate('occupant');
  
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
    const occupantIDs = req.params.occupantID;

    try {
        // Step 1: Get occupant's name from User table using occupantID
        const occupants = await User.findById(occupantIDs);

        if (!occupants) {
            res.status(404).json({ message: 'Occupant not found' });
            return;
        }

        // Extract the occupant's name
        const occupantNames = occupants.firstName;

        res.status(200).json({
            occupantNames,
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
    const occupantId = req.body.occupant;
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
            ...(occupantId ? { occupant: occupantId } : {}),
            utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" }  } : {}),
        });
  
        utility = await Utility.find({
            boarding:boardingId,
            ...(occupantId ? { occupant: occupantId } : {}),
            utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" } } : {}),
        })
            .collation({ locale: "en" })
            .sort({ [sortBy]: order })
            .skip(skipCount)
            .populate(['occupant','boarding'])
            .limit(pageSize);
            
    } 
    
    if (utilityType == 'Water') {
        totalRows = await Utility.countDocuments({
            boarding:boardingId,
            ...(occupantId ? { occupant: occupantId } : {}),
            utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" }  } : {}),
        });
  
        utility = await Utility.find({
            boarding:boardingId,
            ...(occupantId ? { occupant: occupantId } : {}),
            utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" } } : {}),
        })
            .collation({ locale: "en" })
            .sort({ [sortBy]: order })
            .skip(skipCount)
            .populate(['occupant','boarding'])
            .limit(pageSize);
    } else {
        totalRows = await Utility.countDocuments({
          boarding:boardingId,
          ...(occupantId ? { occupant: occupantId } : {}),
          utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" } } : {}),
        });
  
        utility = await Utility.find({
            boarding:boardingId,
            ...(occupantId ? { occupant: occupantId } : {}),
            utilityType,
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(search ? { description: { $regex: search, $options: "i" } } : {}),
        })
            .collation({ locale: "en" })
            .sort({ [sortBy]: order })
            .skip(skipCount)
            .populate(['occupant','boarding'])
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