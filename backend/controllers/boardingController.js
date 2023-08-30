import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Boarding from '../models/boardingModel.js';
import Room from '../models/roomModel.js';

// @desc    Register a new Boarding
// route    POST /api/boardings/register
// @access  Private - Owner
const registerBoarding = asyncHandler(async (req, res) => {

    const {
        ownerId,
        boardingName, 
        address, 
        city,
        location,
        boardingImages, 
        noOfRooms,
        noOfCommonBaths,
        noOfAttachBaths, 
        facilities, 
        utilityBills, 
        food, 
        phoneNo, 
        gender, 
        boardingType,
        keyMoney,
        rent,
        description,
        status,
        bankAccNo,
        bankAccName,
        bankName,
        bankBranch
    } = req.body;

    var boardingExists = await Boarding.findOne({ boardingName: boardingName, 'owner': ownerId });
    
    if(boardingExists){
        res.status(400);
        throw new Error('Boarding Already Exists');
    }

    var owner = await User.findById(ownerId);

    owner.bankAccNo = bankAccNo || owner.bankAccNo;
    owner.bankAccName = bankAccName || owner.bankAccName;
    owner.bankName = bankName || owner.bankName;
    owner.bankBranch = bankBranch || owner.bankBranch;

    owner = await owner.save();

    const boarding = await Boarding.create({
        boardingName,
        address,
        city,
        location,
        boardingImages,
        noOfRooms,
        noOfCommonBaths,
        noOfAttachBaths, 
        facilities,
        utilityBills,
        food,
        phoneNo,
        gender,
        boardingType,
        keyMoney,
        rent,
        description,
        owner,
        status 
    });

    if(boarding){
        res.status(201).json({
            boarding
        });
    }else{
        res.status(400);
        throw new Error('Invalid Boarding Data');
    }

});

// @desc    Add a Room to Boarding
// route    POST /api/boardings/addroom
// @access  Private - Owner
const addRoom = asyncHandler(async (req, res) => {

    const {
        roomNo,
        boardingId,
        roomImages,
        noOfBeds,
        noOfCommonBaths,
        noOfAttachBaths, 
        keyMoney,
        rent,
        description,
        status
    } = req.body;

    var roomExists = await Boarding.findOne({ boardingId, roomNo });
    
    if(roomExists){
        res.status(400);
        throw new Error('Room Already Exists');
    }

    const room = await Room.create({
        roomNo,
        boardingId,
        roomImages,
        noOfBeds,
        noOfCommonBaths,
        noOfAttachBaths, 
        keyMoney,
        rent,
        description,
        status
    });

    const updatedBoarding = await Boarding.findOneAndUpdate(
        { _id: boardingId },
        { $push: { room: room._id } },
        { new: true }
    ).populate('room').populate('owner');

    if(room){
        res.status(201).json({
            room
        });
    }else{
        res.status(400);
        throw new Error('Invalid Room Data');
    }

});

// @desc    Get all Boardings of particular owner
// route    GET /api/boardings/owner/:ownerId/:page
// @access  Private - Owner
const getOwnerBoardings = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId;
    const page = req.params.page || 1;
    const pageSize = 5;

    const skipCount = (page - 1) * pageSize;

    var totalPages = await Boarding.countDocuments({owner:ownerId});
    totalPages = Math.ceil(parseInt(totalPages)/pageSize);

    const boardings = await Boarding.find({owner:ownerId}).populate(['room','owner']).skip(skipCount).limit(pageSize);
    
    if(boardings){
        res.status(200).json({
            boardings,
            totalPages
        })
    }
    else{
        res.status(400);
        throw new Error("No Boardings Available")
    }
});

// @desc    Get all Boardings of particular owner
// route    GET /api/boardings/occupant/:occupantId
// @access  Private - Occupant
const getOccupantBoarding = asyncHandler(async (req, res) => {
    const occupantId = req.params.occupantId

    const Room = await Room.find({occupant:occupantId});
    
    if(Room){
        res.status(200).json({
            Room
        })
    }
    else{
        res.status(400);
        throw new Error("No Boardings Available")
    }
});

export { 
    registerBoarding,
    addRoom,
    getOwnerBoardings,
    getOccupantBoarding
};