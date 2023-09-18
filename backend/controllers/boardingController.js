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
        gender, 
        boardingType,
        keyMoney,
        rent,
        description,
        bankAccNo,
        bankAccName,
        bankName,
        bankBranch
    } = req.body;

    var boardingExists = await Boarding.findOne({ boardingName: boardingName });
    
    if(boardingExists){
        res.status(400);
        throw new Error('A Boarding Already Exists With The Same Name');
    }
    else{

        var owner = await User.findById(ownerId).select('-password');
    
        owner.bankAccNo = bankAccNo || owner.bankAccNo;
        owner.bankAccName = bankAccName || owner.bankAccName;
        owner.bankName = bankName || owner.bankName;
        owner.bankBranch = bankBranch || owner.bankBranch;
    
        owner = await owner.save();
    
        var status;
        if(boardingType == 'Annex'){
            status = 'PendingApproval'
        }
        else{
            status = 'PendingRoom'
        }
    
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
                boarding,
                owner
            });
        }else{
            res.status(400);
            throw new Error('Invalid Boarding Data');
        }
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
        description
    } = req.body;

    var boardingExists = await Boarding.findOne({ _id:boardingId });
    
    if(!boardingExists){
        res.status(400);
        throw new Error('Boarding Not Found!');
    }

    var roomExists = await Room.findOne({ boardingId, roomNo });

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
        description
    });

    const updatedBoarding = await Boarding.findOneAndUpdate(
        { _id: boardingId },
        { 
            $push: { room: room._id },
            $set: { status: 'PendingApproval' }
        },
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
// route    GET /api/boardings/owner/:ownerId/:page/:status
// @access  Private - Owner
const getOwnerBoardings = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId;
    const page = req.params.page || 1;
    const status = req.params.status;
    const pageSize = 5;

    const skipCount = (page - 1) * pageSize;

    var totalPages = await Boarding.countDocuments({owner:ownerId, status});
    totalPages = Math.ceil(parseInt(totalPages)/pageSize);

    const boardings = await Boarding.find({owner:ownerId, status}).populate(['room','owner']).skip(skipCount).limit(pageSize);

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
const getOccupantBoarding = asyncHandler(async (req, res) => {
    const occupantId = req.params.occupantId

    const room = await Room.find({occupant:occupantId});
    
    if(room){
        res.status(200).json({
            room
        })
    }
    else{
        res.status(400);
        throw new Error("No Boardings Available")
    }
});

// @desc    Update Visibility of particular boarding
// route    PUT /api/boardings/updateBoardingVisibility/
const updateBoardingVisibility = asyncHandler(async (req, res) => {
    const boardingId = req.body.id;

    const boarding = await Boarding.findById(boardingId).populate('room');
    console.log(boarding);
    if(boarding){

        var boardingCapacity = 0;
        var boardingOccupantCount = 0;

        for(let i = 0; i < boarding.room.length; i++){
            boardingCapacity += parseInt(boarding.room[i].noOfBeds);
        }

        for(let i = 0; i < boarding.room.length; i++){
            boardingOccupantCount += boarding.room[i].occupant.length;
        }

        if(boarding.occupant && boarding.boardingType == 'Annex'){
            res.status(400);
            throw new Error(`The annex is already rented out!`)
        }
        else if(boardingCapacity == boardingOccupantCount && boarding.boardingType == 'Hostel'){
            res.status(400);
            throw new Error("There arent any free rooms available")
        }
        else{
            boarding.visibility = !boarding.visibility;
            const updatedBoarding = await boarding.save();
            res.status(200).json({
                message:'Boarding updated Successfully'
            })
        }
    }
    else{
        res.status(400);
        throw new Error("Oops Something went wrong :(")
    }
});

// @desc    Delete particular boarding
// route    DELETE /api/boardings/deleteBoarding/:boardingId
const deleteBoarding = asyncHandler(async (req, res) => {
    const boardingId = req.params.boardingId;

    const boarding = await Boarding.findById(boardingId).populate('room');
    
    if(boarding){

        var occupantCount = 0;
        console.log(boarding);
        for(let i = 0; i < boarding.room.length; i++){
            occupantCount += boarding.room[i].occupant.length;
        }

        console.log(boarding.occupant);
        if(occupantCount == 0 && !boarding.occupant){

            if(boarding.boardingType == 'Hostel' && boarding.room.length > 0){
                for(let i = 0; i < boarding.room.length; i++){
                    await Room.findByIdAndDelete(boarding.room[i]._id);
                }
            }

            await Boarding.findByIdAndDelete(boardingId);

            res.status(200).json({
                message:'Boarding deleted successfully!'
            })
        }
        else{
            res.status(400);
            throw new Error("Can't delete boarding when there are occupants!")
        }
    }
    else{
        res.status(400);
        throw new Error("Oops something went wrong :(");
    }
});

export { 
    registerBoarding,
    addRoom,
    getOwnerBoardings,
    getOccupantBoarding,
    updateBoardingVisibility,
    deleteBoarding
};