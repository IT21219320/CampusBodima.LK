import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Boarding from '../models/boardingModel.js';
import Room from '../models/roomModel.js';
import storage from '../utils/firebaseConfig.js';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/mailer.js'
import { sendSMS } from '../utils/smsSender.js';
import { ref, uploadBytesResumable, deleteObject  } from "firebase/storage";
import Reservation from '../models/reservationModel.js';
import ReservationHistory from '../models/reservationHistory.js';

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

    const boarding = await Boarding.findById(boardingId);

    //Mark boarding as PendingApproval if it was already PendingApproval or PendingRoom, before the new room was added
    //If it was already approved, keep it as approved
    let status = "Approved";
    if(boarding.status == "PendingRoom" || boarding.status == "PendingApproval"){
        status = "PendingApproval"
    }

    const approvedRooms = await Room.find({boardingId, status:"Approved"})

    //If there aren't any approved rooms for the boarding after creating the new room, mark the boarding as PendingApproval
    if(approvedRooms.length == 0){
        status = "PendingApproval"
    }

    let boardingRent;
    if(boarding.rent){
        if(boarding.rent > rent){
            boardingRent = rent;
        }
        else{
            boardingRent = boarding.rent;
        }
    }
    else{
        boardingRent = rent;
    }
    

    const updatedBoarding = await Boarding.findOneAndUpdate(
        { _id: boardingId },
        { 
            $push: { room: room._id },
            $set: { status, rent: boardingRent}
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

// @desc    Add occupant
// route    POST /api/boardings/addoccupant
const addOccupant = asyncHandler(async (req, res) => {
    const { Email, BoardingId, RoomID } = req.body;

    const user = await User.findOne({email:Email,userType:'occupant'});
    let boarding = await Boarding.findById(BoardingId);
    let reservation;

    if(boarding){
        
        if(user){
            const reservation = await Reservation.findOne({occupantID:user._id})
            if(reservation){
                res.status(400);
                throw new Error('User already has a reservation');
            }
        }

        if(boarding.boardingType == "Hostel"){
            let room = await Room.findById(RoomID);
            if(room.occupant.length == parseInt(room.noOfBeds)){
                res.status(400);
                throw new Error('Room is full');
            }

            room.visibility = false;
            room.occupant.push('123456789012');

            await room.save();

            reservation = await Reservation.create({
                boardingId:BoardingId,
                boardingType:Email,
                roomID:RoomID,
                occupantID:'123456789012',
                Duration:24,
                paymentType:'Cash',
                paymentStatus:'Pending',
                status:'PendingInvite'
            });
        }
        else{
            if(boarding.occupant){
                res.status(400);
                throw new Error('Boarding is already rented out');
            }

            boarding.visibility = false;
            boarding.occupant = '123456789012';

            await boarding.save();

            reservation = await Reservation.create({
                boardingId:BoardingId,
                boardingType:Email,
                occupantID:'123456789012',
                Duration:24,
                paymentType:'Cash',
                paymentStatus:'Pending',
                status:'PendingInvite'
            });
        }

        console.log(reservation);

        var token = jwt.sign({ reservation }, process.env.JWT_SECRET, { 
            expiresIn: '7d' 
        });
    
        token = `${token.split('.')[0]}/${token.split('.')[1]}/${token.split('.')[2]}`;

        const message = `<p>Dear Occupant,</p>
                        <p>You're invited to join ${boarding.boardingName}! Click the following link to complete your registration and become a part of our community:</p>
                        <p><a href="http://${process.env.DOMAIN}/occupant/boarding/join/${token}">Invitation Link</a></p>
                        <p>If you are already registered, please log in first and then click the link.</p>
                        <p>If you haven't registered yet, create an account as an occupant and join ${boarding.boardingName}.</p>
                        <p>Please note that this invitation link will expire in 7 days.</p>
                        <p>We look forward to welcoming you!</p>
                        <p>Best regards,<br>
                        The Campus Bodim Team</p>`;

        sendMail(Email, message, `Invitation to Join ${boarding.boardingName}`);

        res.status(200).json({message:'Email sent successfully'});

    }
    else{
        res.status(400);
        throw new Error("Opps! Something went wrong");
    }

})

// @desc    Add occupant
// route    POST /api/boardings/occupant/Join
const occupantJoin = asyncHandler(async (req, res) => {
    const { userId, token } = req.body;
    
    const reservation = await Reservation.findById(jwt.decode(token).reservation._id)
    
    if(!reservation){
        res.status(400);
        throw new Error("Opps! Looks like your invitation has been cancelled. Sorry for the inconvenience")
    }

    const boarding = await Boarding.findById(reservation.boardingId);
    const reservationExists = await Reservation.findOne({occupantID:userId})


    if(reservationExists){
        res.status(400);
        throw new Error("You already have a reservation")
    }

    if(boarding){
        if(boarding.boardingType == "Hostel"){
            const room = await Room.findById(reservation.roomID);
            if(room.noOfBeds == room.occupant.length){
                res.status(400);
                throw new Error("Boarding room is full")
            }
            else{
                reservation.occupantID = userId;
                reservation.boardingType = 'Hostel';
                reservation.paymentStatus = 'Paid';
                reservation.status = 'Approved';
            }
        }
        else if(boarding.boardingType == "Annex"){
            if(boarding.occupantId){
                res.status(400);
                throw new Error("Boarding is full")
            }
            else{
                reservation.occupantID = userId;
                reservation.boardingType = 'Annex';
                reservation.paymentStatus = 'Paid';
                reservation.status = 'Approved';
            }
        }
    }else{
        res.status(400);
        throw new Error("Boarding not found")
    }

    try {
        await reservation.save()
        res.status(200).json({message: 'Successfully reserved'})
    } catch (error) {
        res.status(400);
        throw new Error(error);
    }
    

})

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

// @desc    Get Boarding by ID
// route    GET /api/boardings/:boardingId
const getBoardingById = asyncHandler(async (req, res) => {
    const boardingId = req.params.boardingId;
   
    const boarding = await Boarding.findById(boardingId).populate(['room','owner']);

    boarding.room.sort((a, b) => a.roomNo - b.roomNo);
    
    if(boarding){
        res.status(200).json({
            boarding
        })
    }
    else{
        res.status(400);
        throw new Error("Boarding Not Found!")
    }
});

// @desc    Get Reservations by boarding ID
// route    GET /api/boardings/:boardingId/reservations
const getReservationsByBoardingId = asyncHandler(async (req, res) => {
    const boardingId = req.params.boardingId;
   
    const reservations = await Reservation.find({boardingId}).populate('occupantID');
    
    if(reservations.length > 0){
        res.status(200).json({
            reservations
        })
    }
    else{
        res.status(400);
        throw new Error("No Reservations Found!")
    }
});

// @desc    Get Reservations by boarding ID
// route    GET /api/boardings/:roomId/reservations
const getReservationsByRoomId = asyncHandler(async (req, res) => {
    const roomId = req.params.roomId;
   
    const reservations = await Reservation.find({roomID:roomId}).populate('occupantID');
    
    if(reservations.length > 0){
        res.status(200).json({
            reservations
        })
    }
    else{
        res.status(400);
        throw new Error("No Reservations Found!")
    }
});

// @desc    Get Room by ID
// route    GET /api/rooms/:roomId
const getRoomById = asyncHandler(async (req, res) => {
    const roomId = req.params.roomId;
   
    const room = await Room.findById(roomId).populate('boardingId');
    
    if(room){
        res.status(200).json({
            room
        })
    }
    else{
        res.status(400);
        throw new Error("Room Not Found!")
    }
});

// @desc    Get all Boardings
// route    POST /api/boardings/all
const getAllBoardings = asyncHandler(async (req, res) => {
    const page = req.body.page || 0;
    const pageSize = req.body.pageSize;
    const status = req.body.status;
    const food = req.body.food;
    const utilityBills = req.body.utilityBills;
    const noOfRooms = req.body.noOfRooms;
    const boardingType = req.body.boardingType;
    const gender = req.body.gender;
    const rentRange = req.body.rentRange;
    const rent = req.body.rent;
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const date = req.body.date;
    const search = req.body.search;
    const sortBy = req.body.sortBy;
    const order = req.body.order;

    const startRent = rentRange[0];
    const endRent = rentRange[1];
    
    endDate.setHours(23, 59, 59, 999);

    const skipCount = (page) * pageSize;
    
    let totalRows;
    let boardings;
    if(boardingType == 'Annex'){

        totalRows = await Boarding.countDocuments({
            boardingType,
            ...(status !== 'All' ? { status } : {}),
            ...(food !== 'All' ? { food } : {}),
            ...(utilityBills !== 'All' ? { utilityBills } : {}),
            ...(noOfRooms > 0 ? (noOfRooms > 10 ? {noOfRooms: "10+"} : { noOfRooms })  : {}),
            ...(rent !== 'All' ? { rent: { $gte: startRent, $lte: endRent } } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(gender !== 'All' ? { 
                $and: [{
                    $or: [
                        { gender }, 
                        { gender: 'Any' }
                    ]},{
                    $or: [
                        { boardingName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { city: { $regex: search, $options: "i" } },
                    ]
                }]
            } : {
                $or: [
                    { boardingName: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                ]
            }),
        });

        boardings = await Boarding.find({
            boardingType,
            ...(status !== 'All' ? { status } : {}),
            ...(food !== 'All' ? { food } : {}),
            ...(utilityBills !== 'All' ? { utilityBills } : {}),
            ...(noOfRooms > 0 ? (noOfRooms > 10 ? {noOfRooms: "10+"} : { noOfRooms })  : {}),
            ...(rent !== 'All' ? { rent: { $gte: startRent, $lte: endRent } } : {}), 
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(gender !== 'All' ? { 
                $and: [{
                    $or: [
                        { gender }, 
                        { gender: 'Any' }
                    ]},{
                    $or: [
                        { boardingName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { city: { $regex: search, $options: "i" } },
                    ]
                }]
            } : {
                $or: [
                    { boardingName: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                ]
            }),
        }).populate({
            path:'room',
            populate: {
                path: 'occupant', 
            },
        }).collation({locale: "en"}).sort({ [sortBy]: order }).skip(skipCount).limit(pageSize);

    }
    else{

        const rooms = await Room.find({
            ...(status !== 'All' ? { status } : {}),
            ...(rent !== 'All' ? { rent: { $gte: startRent, $lte: endRent } } : {}), 
        });
        const roomConditions = rooms.map(room => ({ room: room._id }));

        console.log(roomConditions.map(condition => condition['room'].toString()));

        totalRows = await Boarding.countDocuments({
            boardingType,
            ...(status !== 'All' ? { status } : {status: { $ne: 'PendingRoom' }}),
            ...(food !== 'All' ? { food } : {}),
            ...(utilityBills !== 'All' ? { utilityBills } : {}),
            ...(noOfRooms !== 0 ? { $expr: { $eq: [{ $size: '$room' }, noOfRooms] } } : noOfRooms > 10 ? {$expr: { $gt: [{ $size: '$room' }, 10] }} : {}),
            ...(rent !== 'All' ? {
                room: {
                    $in: roomConditions.map(condition => condition['room'].toString())
                }
              } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(gender !== 'All' ? { 
                $and: [{
                    $or: [
                        { gender }, 
                        { gender: 'Any' }
                    ]},{
                    $or: [
                        { boardingName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { city: { $regex: search, $options: "i" } },
                    ]
                }]
            } : {
                $or: [
                    { boardingName: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                ]
            }), 
        });


        boardings = await Boarding.find({
            boardingType,
            ...(status !== 'All' ? { status } : {status: { $ne: 'PendingRoom' }}),
            ...(food !== 'All' ? { food } : {}),
            ...(utilityBills !== 'All' ? { utilityBills } : {}),
            ...(noOfRooms !== 0 ? { $expr: { $eq: [{ $size: '$room' }, noOfRooms] } } : noOfRooms > 10 ? {$expr: { $gt: [{ $size: '$room' }, 10] }} : {}),
            ...(rent !== 'All' ? {
                room: {
                    $in: roomConditions.map(condition => condition['room'].toString())
                }
              } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(gender !== 'All' ? { 
                $and: [{
                    $or: [
                        { gender }, 
                        { gender: 'Any' }
                    ]},{
                    $or: [
                        { boardingName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { city: { $regex: search, $options: "i" } },
                    ]
                }]
            } : {
                $or: [
                    { boardingName: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                ]
            }), 
        }).populate({
            path:'room',
            populate: {
                path: 'occupant', 
            },
        }).collation({locale: "en"}).sort({ [sortBy]: order }).skip(skipCount).limit(pageSize);

    }
    
    
    if(boardings){
        res.status(200).json({
            boardings,
            totalRows
        })
    }
    else{
        res.status(400);
        throw new Error("No Boardings Available")
    }
});

// @desc    Get all visible Boardings
// route    POST /api/boardings/all
const getAllPublicBoardings = asyncHandler(async (req, res) => {
    const page = req.body.page || 0;
    const pageSize = req.body.pageSize;
    const status = req.body.status;
    const food = req.body.food;
    const utilityBills = req.body.utilityBills;
    const noOfRooms = req.body.noOfRooms;
    const boardingType = req.body.boardingType;
    const gender = req.body.gender;
    const city = req.body.city;
    const rentRange = req.body.rentRange;
    const rent = req.body.rent;
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const date = req.body.date;
    const search = req.body.search;
    let facilities = req.body.facilities;
    let sortBy = req.body.sortBy;
    let order = req.body.order;

    if(facilities.length == 0){
        facilities = "Any"
    }

    if(sortBy == 'updatedAtDesc'){
        sortBy = 'updatedAt'
        order = -1
    }
    else if(sortBy == 'updatedAtAsc'){
        sortBy = 'updatedAt'
        order = 1
    }
    else if(sortBy == 'rentDesc'){
        sortBy = 'rent'
        order = -1
    }
    else if(sortBy == 'rentAsc'){
        sortBy = 'rent'
        order = 1
    }



    const startRent = rentRange[0];
    const endRent = rentRange[1];
    
    endDate.setHours(23, 59, 59, 999);

    const skipCount = (page) * pageSize;
    
    let totalRows;
    let boardings;
    const cities = await Boarding.distinct('city');
    if(boardingType == 'Annex'){

        totalRows = await Boarding.countDocuments({
            boardingType,
            visibility: true,
            status: 'Approved',
            ...(facilities !== 'Any' ? { facilities: {$all: facilities} } : {}),
            ...(food !== 'All' ? { food } : {}),
            ...(utilityBills !== 'All' ? { utilityBills } : {}),
            ...(noOfRooms > 0 ? (noOfRooms > 10 ? {noOfRooms: "10+"} : { noOfRooms })  : {}),
            ...(rent !== 'All' ? { rent: { $gte: startRent, $lte: endRent } } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(city !== 'All' ? { city } : {}),
            ...(gender !== 'All' ? { 
                $and: [{
                    $or: [
                        { gender }, 
                        { gender: 'Any' }
                    ]},{
                    $or: [
                        { boardingName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { city: { $regex: search, $options: "i" } },
                    ]
                }]
            } : {
                $or: [
                    { boardingName: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                ]
            }),
        });

        boardings = await Boarding.find({
            boardingType,
            visibility: true,
            status: 'Approved',
            ...(facilities !== 'Any' ? { facilities: {$all: facilities} } : {}),
            ...(food !== 'All' ? { food } : {}),
            ...(utilityBills !== 'All' ? { utilityBills } : {}),
            ...(noOfRooms > 0 ? (noOfRooms > 10 ? {noOfRooms: "10+"} : { noOfRooms })  : {}),
            ...(rent !== 'All' ? { rent: { $gte: startRent, $lte: endRent } } : {}), 
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}),
            ...(city !== 'All' ? { city } : {}),
            ...(gender !== 'All' ? { 
                $and: [{
                    $or: [
                        { gender }, 
                        { gender: 'Any' }
                    ]},{
                    $or: [
                        { boardingName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { city: { $regex: search, $options: "i" } },
                    ]
                }]
            } : {
                $or: [
                    { boardingName: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                ]
            }),
        }).populate({
            path:'room',
            populate: {
                path: 'occupant', 
            },
        }).collation({locale: "en"}).sort({ [sortBy]: order }).skip(skipCount).limit(pageSize);

    }
    else{

        const rooms = await Room.find({
            status: 'Approved',
            visibility: true,
        });


        totalRows = await Boarding.countDocuments({
            boardingType,
            visibility: true,
            status: 'Approved',
            room: { $in: rooms},
            ...(facilities !== 'Any' ? { facilities: {$all: facilities} } : {}),
            ...(food !== 'All' ? { food } : {}),
            ...(utilityBills !== 'All' ? { utilityBills } : {}),
            ...(noOfRooms !== 0 ? { $expr: { $eq: [{ $size: '$room' }, noOfRooms] } } : noOfRooms > 10 ? {$expr: { $gt: [{ $size: '$room' }, 10] }} : {}),
            ...(rent !== 'All' ? { rent: { $gte: startRent, $lte: endRent } } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(city !== 'All' ? { city } : {}),
            ...(gender !== 'All' ? { 
                $and: [{
                    $or: [
                        { gender }, 
                        { gender: 'Any' }
                    ]},{
                    $or: [
                        { boardingName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { city: { $regex: search, $options: "i" } },
                    ]
                }]
            } : {
                $or: [
                    { boardingName: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                ]
            }), 
        });


        boardings = await Boarding.find({
            boardingType,
            visibility: true,
            status: 'Approved',
            room: { $in: rooms},
            ...(facilities !== 'Any' ? { facilities: {$all: facilities} } : {}),
            ...(food !== 'All' ? { food } : {}),
            ...(utilityBills !== 'All' ? { utilityBills } : {}),
            ...(noOfRooms !== 0 ? { $expr: { $eq: [{ $size: '$room' }, noOfRooms] } } : noOfRooms > 10 ? {$expr: { $gt: [{ $size: '$room' }, 10] }} : {}),
            ...(rent !== 'All' ? { rent: { $gte: startRent, $lte: endRent } } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(date !== 'All' ? { createdAt: { $gte: startDate, $lte: endDate } } : {}), //gte is greater than or eqal and lte is less than or equal
            ...(city !== 'All' ? { city } : {}),
            ...(gender !== 'All' ? { 
                $and: [{
                    $or: [
                        { gender }, 
                        { gender: 'Any' }
                    ]},{
                    $or: [
                        { boardingName: { $regex: search, $options: "i" } },
                        { address: { $regex: search, $options: "i" } },
                        { city: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } },
                    ]
                }]
            } : {
                $or: [
                    { boardingName: { $regex: search, $options: "i" } },
                    { address: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ]
            }), 
        }).populate({
            path:'room',
            populate: {
                path: 'occupant', 
            },
        }).collation({locale: "en"}).sort({ [sortBy]: order }).skip(skipCount).limit(pageSize);

    }
    
    
    if(boardings){
        res.status(200).json({
            boardings,
            totalRows,
            cities
        })
    }
    else{
        res.status(400);
        throw new Error("No Boardings Available")
    }
});

// @decs    Get Pending Approval Boardings
// route    GET /api/boardings/pendingApproval
const getPendingApprovalBoardings = asyncHandler(async (req, res) => {
    const page = req.params.page || 0;
    const pageSize = req.params.pageSize;

    const skipCount = (page) * pageSize;

    const rooms = await Room.find({status:'PendingApproval'});
    const roomConditions = rooms.map(room => ({ room: room._id }));

    const boardings = await Boarding.find({
        $or: [
          { status: 'PendingApproval' },
          { room: { $in: roomConditions.map(condition => condition['room'].toString()) } }
        ]
      }).populate(['room','owner']).skip(skipCount).limit(pageSize);

    const totalRows = await Boarding.countDocuments({
        $or: [
          { status: 'PendingApproval' },
          { room: { $in: roomConditions.map(condition => condition['room'].toString()) } }
        ]
      }).skip(skipCount).limit(pageSize);

    res.status(200).json({
        boardings,
        totalRows
    })
})

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
            if(boarding.room[i].status == 'Approved'){
                boardingCapacity += parseInt(boarding.room[i].noOfBeds);
            }
        }

        for(let i = 0; i < boarding.room.length; i++){
            if(boarding.room[i].status == 'Approved'){
                boardingOccupantCount += boarding.room[i].occupant.length;
            }
        }

        if(boarding.occupant && boarding.boardingType == 'Annex'){
            boarding.visibility = false;
            const updatedBoarding = await boarding.save();
            res.status(400);
            throw new Error(`The annex is already rented out!`)
        }
        else if(boardingCapacity == boardingOccupantCount && boarding.boardingType == 'Hostel'){
            boarding.visibility = false;
            const updatedBoarding = await boarding.save();
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

// @desc    Update Visibility of particular boarding
// route    PUT /api/boardings/updateBoardingVisibility/
const updateRoomVisibility = asyncHandler(async (req, res) => {
    const roomId = req.body.id;

    const room = await Room.findById(roomId);
    
    if(room){

        var roomCapacity = room.noOfBeds;
        var roomOccupantCount = room.occupant.length;

        if(roomCapacity == roomOccupantCount){
            room.visibility = false;
            const updatedRoom = await room.save();
            
            res.status(400);
            throw new Error("There arent any free beds available")
        }
        else{
            room.visibility = !room.visibility;
            const updatedRoom = await room.save();
            res.status(200).json({
                message:'Room updated Successfully'
            })
        }
    }
    else{
        res.status(400);
        throw new Error("Oops Something went wrong :(")
    }
});

// @desc    Update boarding status
// route    PUT /api/boardings/approveBoarding/
const approveBoarding = asyncHandler(async (req, res) => {
      const boardingId = req.body.boardingId;

      try {
          let boarding = await Boarding.findById(boardingId).populate('owner').populate('room');

          var boardingCapacity = 0;
          var boardingOccupantCount = 0;

          for(let i = 0; i < boarding.room.length; i++){
              boardingCapacity += parseInt(boarding.room[i].noOfBeds);
          }

          for(let i = 0; i < boarding.room.length; i++){
              boardingOccupantCount += boarding.room[i].occupant.length;
          }

          let visibility = true;
          if(boarding.boardingType == 'Annex' && boarding.occupant){
            visibility = false;
          }

          if(boarding.boardingType == 'Hostel' && boardingCapacity==boardingOccupantCount){
            visibility = false;
          }

          boarding.status = "Approved";
          boarding.visibility = visibility;
          boarding = await boarding.save();
    

          const rooms = await Room.find({boardingId});
          let room;
          let roomVisibility = true;
          for(let i = 0; i < rooms.length; i++){
            room = await Room.findById(rooms[i]._id);

            if(room.noOfBeds == room.occupant.length){
                roomVisibility = false;
            }

            room.status = 'Approved'
            room.visibility = roomVisibility

            await room.save();
          }

    
          const message = `<p><b>Hello ${boarding.owner.firstName},</b></p>
          <p>We are pleased to inform you that your registered boarding, ${boarding.boardingName}, has been approved.</p>
          <p>Thank you for using CampusBodima!</p>
          <p>Best wishes,<br>The CampusBodima Team</p>`
        
          sendMail(boarding.owner.email,message,"Your Registered Boarding Has Been Approved");

          res.status(200).json('')
      } catch (error) {
            res.status(400)
            throw new Error(error);
      }


})

// @desc    Update Room status
// route    PUT /api/boardings/approveRoom/
const approveRoom = asyncHandler(async (req, res) => {
      const roomId = req.body.roomId;

      try {
          let room = await Room.findById(roomId).populate({
            path:'boardingId',
            populate: {
                path: 'owner', 
            },
        });

          var roomCapacity = room.noOfBeds;
          var roomOccupantCount = room.occupant.length;

          let visibility = true;
          if(roomCapacity==roomOccupantCount){
            visibility = false;
          }

          room.status = "Approved";
          room.visibility = visibility;
          room = await room.save();
    
          const message = `<p><b>Hello ${room.boardingId.owner.firstName},</b></p>
          <p>We are pleased to inform you that the room ${room.roomNo} in ${room.boardingId.boardingName} has been approved.</p>
          <p>Thank you for using CampusBodima!</p>
          <p>Best wishes,<br>The CampusBodima Team</p>`
        
          sendMail(room.boardingId.owner.email,message,"Your Registered Room Has Been Approved");

          res.status(200).json('')
      } catch (error) {
            res.status(400)
            throw new Error(error);
      }


})

// @desc    Delete particular boarding
// route    DELETE /api/boardings/rejectBoarding/
const rejectBoarding = asyncHandler(async (req, res) => {
    const boardingId = req.body.boardingId;

    const boarding = await Boarding.findById(boardingId).populate(['room','owner']);
    
    if(boarding){

        var occupantCount = 0;
        for(let i = 0; i < boarding.room.length; i++){
            occupantCount += boarding.room[i].occupant.length;
        }

        let message;
        let email = boarding.owner.email;
        if(occupantCount == 0 && !boarding.occupant){

            if(boarding.boardingType == 'Hostel' && boarding.room.length > 0){
                var fileRef;
                for(let i = 0; i < boarding.room.length; i++){

                    for (let j = 0; j < boarding.room[i].roomImages.length; j++) {
                        fileRef = ref(storage,boarding.room[i].roomImages[j]);
                    
                        try {
                            await deleteObject(fileRef); // deleteing images of the room
                        } catch (err) {
                            console.log(err);;
                        }        
                    }
                    await Room.findByIdAndDelete(boarding.room[i]._id); // deleting the room

                }
            }

            for (let i = 0; i < boarding.boardingImages.length; i++) {
                fileRef = ref(storage,boarding.boardingImages[i]);
            
                try {
                    await deleteObject(fileRef); // deleting images of boarding
                } catch (err) {
                    console.log(err);
                }        
            }
            await Boarding.findByIdAndDelete(boardingId);

            message = `Dear ${boarding.owner.firstName},<br><br>
            We regret to inform you that your boarding, ${boarding.boardingName} does not meet our listing criteria at this time, and your registration has been declined.<br>
            While we appreciate your interest, please review our guidelines and consider making necessary updates before reapplying.<br>
            For any questions, contact us at info.campusbodima@gmail.com.<br><br>
            Best regards,<br>
            The CampusBodima Team`;
        }
        else{
            let boarding = await Boarding.findById(boardingId).populate('owner');
            boarding.status = "PendingRoom";
            boarding = await boarding.save();

            message = `Dear ${boarding.owner.firstName},<br><br>
            We regret to inform you that your boarding, ${boarding.boardingName} does not meet our listing criteria at this time, and your registration has been moved to the incomplete section.<br>
            Please review our guidelines and consider making necessary updates to get your boarding approved.<br>
            For any questions, contact us at info.campusbodima@gmail.com.<br><br>
            Best regards,<br>
            The CampusBodima Team`
        }

        sendMail(email,message,"Your Registered Boarding Has Been Declined");      

        res.status(200).json({
            message:'Boarding rejected successfully!'
        })
    }
    else{
        res.status(400);
        throw new Error("Oops something went wrong :(");
    }
});

// @desc    Delete particular room
// route    DELETE /api/boardings/rejectRoom/
const rejectRoom = asyncHandler(async (req, res) => {
    const roomId = req.body.roomId;

    const room = await Room.findById(roomId).populate({
        path:'boardingId',
        populate: {
            path: 'owner', 
        },
    });
    
    if(room){

        var occupantCount = room.occupant.length;

        let message;
        let email = room.boardingId.owner.email;
        if(occupantCount == 0){

            var fileRef;
            for (let j = 0; j < room.roomImages.length; j++) {
                fileRef = ref(storage,room.roomImages[j]);
            
                try {
                    await deleteObject(fileRef); // deleteing images of the room
                } catch (err) {
                    console.log(err);;
                }        
            }

            let boarding = await Boarding.findById(room.boardingId);
            console.log(boarding);
            boarding.room.pull(room._id);
            boarding = await boarding.save()

            await Room.findByIdAndDelete(room._id); // deleting the room

            if(boarding.room.length == 0){
                boarding.status = "PendingRoom"
                await boarding.save();
            }

            message = `Dear ${room.boardingId.owner.firstName},<br><br>
            We regret to inform you that your room in ${room.boardingId.boardingName} does not meet our listing criteria at this time, and your registration has been declined.<br>
            While we appreciate your interest, please review our guidelines and consider making necessary updates before reapplying.<br>
            For any questions, contact us at info.campusbodima@gmail.com.<br><br>
            Best regards,<br>
            The CampusBodima Team`;
        }
        else{
            const rooms = await Room.findOneAndUpdate({_id:roomId},{ $set: { status: 'Incomplete' } });

            message = `Dear ${room.boardingId.owner.firstName},<br><br>
            We regret to inform you that your room in ${room.boardingId.boardingName} does not meet our listing criteria at this time, and your registration has been moved to the incomplete section.<br>
            Please review our guidelines and consider making necessary updates to get your boarding approved.<br>
            For any questions, contact us at info.campusbodima@gmail.com.<br><br>
            Best regards,<br>
            The CampusBodima Team`
        }

        sendMail(email,message,"Your Registered Boarding Has Been Declined");      

        res.status(200).json({
            message:'Room rejected successfully!'
        })
    }
    else{
        res.status(400);
        throw new Error("Oops something went wrong :(");
    }
});

// @desc    Update Boarding
// route    POST /api/boardings/updateBoarding
const updateBoarding = asyncHandler(async (req, res) => {

    const {
        boardingId,
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
        description
    } = req.body;

    
    console.log(boardingId);
    var boarding = await Boarding.findById(boardingId).populate('room');

    var boardingNameExists = await Boarding.findOne({boardingName});

    var roomOccupantCount = 0;
    if(boarding.boardingType == 'Hostel'){
        for (let i = 0; i < boarding.room.length; i++) {
            roomOccupantCount += boarding.room[i].occupant.length;
        }
    }
    
    if(!boarding){
        res.status(400);
        throw new Error('Boarding Not Found!');
    }
    else if(roomOccupantCount > 0 && boarding.gender!=gender){
        res.status(400);
        throw new Error('Cannot update gender while boarding is occupied!');
    }
    else if(boarding.boardingName!=boardingName && boardingNameExists){
        res.status(400);
        throw new Error('Boarding Name already Taken!');
    }
    else{
    
        boarding.boardingName = boardingName || boarding.boardingName;
        boarding.address = address || boarding.address;
        boarding.city = city || boarding.city;
        boarding.location = location || boarding.location;
        boarding.boardingImages = boardingImages || boarding.boardingImages;
        boarding.facilities = facilities || boarding.facilities;
        boarding.utilityBills = utilityBills || boarding.utilityBills;
        boarding.food = food || boarding.food;
        boarding.gender = gender || boarding.gender;
        boarding.boardingType = boardingType || boarding.boardingType;
        boarding.status = 'PendingApproval';

        if(boarding.boardingType == 'Annex'){
            boarding.description = description || boarding.description;
            boarding.noOfRooms = noOfRooms || boarding.noOfRooms;
            boarding.noOfCommonBaths = noOfCommonBaths || boarding.noOfCommonBaths;
            boarding.noOfAttachBaths = noOfAttachBaths || boarding.noOfAttachBaths;
            boarding.keyMoney = keyMoney || boarding.keyMoney;
            boarding.rent = rent || boarding.rent;
        }

        boarding = await boarding.save();

        if(boarding){
            res.status(201).json({
                message: 'successfully updated',
            });
        }else{
            res.status(400);
            throw new Error('Invalid Boarding Data');
        }
    }


});

// @desc    Update Room
// route    POST /api/boardings/updateRoom
const updateRoom = asyncHandler(async (req, res) => {

    const {
        roomId,
        roomNo, 
        roomImages, 
        noOfBeds,
        noOfCommonBaths,
        noOfAttachBaths, 
        keyMoney,
        rent,
        description
    } = req.body;

    
    var room = await Room.findById(roomId);

    var roomNoExists = await Room.findOne({_id:roomId,roomNo});

    var roomOccupantCount = room.occupant.length;
    
    if(!room){
        res.status(400);
        throw new Error('Room Not Found!');
    }
    else if(roomOccupantCount > 0){
        res.status(400);
        throw new Error('Cannot update room while it is occupied!');
    }
    else if(room.roomNo!=roomNo && roomNoExists){
        res.status(400);
        throw new Error('Room No already Exist!');
    }
    else{
    
        room.roomNo = roomNo || room.roomNo;
        room.roomImages = roomImages || room.roomImages;
        room.status = 'PendingApproval';
        room.description = description || room.description;
        room.noOfBeds = noOfBeds || room.noOfBeds;
        room.noOfCommonBaths = noOfCommonBaths || room.noOfCommonBaths;
        room.noOfAttachBaths = noOfAttachBaths || room.noOfAttachBaths;
        room.keyMoney = keyMoney || room.keyMoney;
        room.rent = rent || room.rent;

        const boarding = await Boarding.findById(room.boardingId)
        if(boarding.rent){
            if(rent < boarding.rent){
                boarding.rent = rent
            }
            else{
                boarding.rent = boarding.rent
            }
        }
        else{
            boarding.rent = rent
        }
        await boarding.save()

        room = await room.save();

        if(room){
            res.status(201).json({
                message: 'successfully updated',
            });
        }else{
            res.status(400);
            throw new Error('Invalid Room Data');
        }
    }


});

// @desc    Delete particular boarding
// route    DELETE /api/boardings/deleteBoarding/:boardingId
const deleteBoarding = asyncHandler(async (req, res) => {
    const boardingId = req.params.boardingId;

    const boarding = await Boarding.findById(boardingId).populate('room');

    console.log(boarding);

    
    if(boarding){

        var occupantCount = 0;
        console.log(boarding);
        for(let i = 0; i < boarding.room.length; i++){
            occupantCount += boarding.room[i].occupant.length;
        }

        if(occupantCount == 0 && !boarding.occupant){

            if(boarding.boardingType == 'Hostel' && boarding.room.length > 0){
                var fileRef;
                for(let i = 0; i < boarding.room.length; i++){

                    for (let j = 0; j < boarding.room[i].roomImages.length; j++) {
                        fileRef = ref(storage,boarding.room[i].roomImages[j]);
                    
                        try {
                            await deleteObject(fileRef); // deleteing images of the room
                        } catch (err) {
                            console.log(err);;
                        }        
                    }
                    await Room.findByIdAndDelete(boarding.room[i]._id); // deleting the room

                }
            }

            for (let i = 0; i < boarding.boardingImages.length; i++) {
                fileRef = ref(storage,boarding.boardingImages[i]);
            
                try {
                    await deleteObject(fileRef); // deleting images of boarding
                } catch (err) {
                    console.log(err);
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

// @desc    Delete particular room
// route    DELETE /api/boardings/deleteRoom/:roomId
const deleteRoom = asyncHandler(async (req, res) => {
    const roomId = req.params.roomId;

    const room = await Room.findById(roomId);
    
    if(room){

        var occupantCount = room.occupant.length;

        if(occupantCount == 0){
            var fileRef;
            for (let i = 0; i < room.roomImages.length; i++) {
                fileRef = ref(storage,room.roomImages[i]);
            
                try {
                    await deleteObject(fileRef); // deleting images of room
                } catch (err) {
                    console.log(err);
                }        
            }
            await Room.findByIdAndDelete(roomId);

            let boarding = await Boarding.findById(room.boardingId);

            boarding.room.pull(roomId);

            if(boarding.room.length == 0){
                boarding.status = "PendingRoom";
                boarding.rent = null
            }
            if(boarding.room.length > 0){
                boarding.room.sort((a, b) => a.rent - b.rent);
                boarding.rent = boarding.room[0].rent;
            }
            
            boarding = await boarding.save();
            
            res.status(200).json({
                message:'Room deleted successfully!',
                roomCount: boarding.room.length
            })
        }
        else{
            res.status(400);
            throw new Error("Can't delete Room when there are occupants!")
        }
    }
    else{
        res.status(400);
        throw new Error("Oops something went wrong :(");
    }
});

// @desc    Delete particular reservation
// route    DELETE /api/boardings/deleteReservation/:reservationId/
const deleteReservation = asyncHandler(async (req, res) => {
    const reservationId = req.params.reservationId;

    const reservation = await Reservation.findByIdAndDelete(reservationId);
    let message;
    let subject;
    
    if(reservation){
        const user = await User.findById(reservation.occupantID);
        let boarding = await Boarding.findById(reservation.boardingId);
        let room = await Room.findById(reservation.roomID);
        if(reservation.boardingType == "Hostel"){


            const reservationHistory = new ReservationHistory({

                boarding: boarding,
                occupant: user,
                room: room,
                ReservedDate: reservation.createdAt,
    
            });
    
            const resHis = await reservationHistory.save();



            room.occupant.pull(reservation.occupantID);
            room.visibility = true;
            
            await room.save();

            boarding = await Boarding.findOneAndUpdate(
                { _id: reservation.boardingId },
                {
                    $set: { visibility: 'true' }
                },
                { new: true }
            ).populate('owner');


            message = `<p>Dear ${user.firstName},</p>
                        <p>You have been removed from <strong>${boarding.boardingName}</strong> by the owner. We hope you've enjoyed your stay.</p>
                        <p>Your feedback is valuable. Kindly share your thoughts so future occupants can benefit. If this was a mistake, contact the boarding owner at <a href="mailto:${boarding.owner.email}">${boarding.owner.email}</a> or call 0${boarding.owner.phoneNo}.</p>
                        <p>Thank you.</p>
                        <p>Best wishes,<br>
                        The Campus Boarding Team</p>`

            subject = `Important Update: Your Boarding Status at ${boarding.boardingName}`



        }
        else if(reservation.boardingType == "Annex"){


            const reservationHistory = new ReservationHistory({

                boarding: boarding,
                occupant: user,
                ReservedDate: reservation.createdAt,
    
            });
    
            const resHis = await reservationHistory.save();


            boarding = await Boarding.findOneAndUpdate(
                { _id: reservation.boardingId },
                {
                    $unset: { occupant: reservation.occupantID },
                    $set: { visibility: 'true' }
                },
                { new: true }
            ).populate('owner');


            message = `<p>Dear ${user.firstName},</p>
                        <p>You have been removed from <strong>${boarding.boardingName}</strong> by the owner. We hope you've enjoyed your stay.</p>
                        <p>Your feedback is valuable. Kindly share your thoughts so future occupants can benefit. If this was a mistake, contact the boarding owner at <a href="mailto:${boarding.owner.email}">${boarding.owner.email}</a> or call 0${boarding.owner.phoneNo}.</p>
                        <p>Thank you.</p>
                        <p>Best wishes,<br>
                        The Campus Boarding Team</p>`

            subject = `Important Update: Your Boarding Status at ${boarding.boardingName}`


        }
        else{// for cancelling invitations
            if(reservation.roomID){
                let room = await Room.findById(reservation.roomID);

                room.visibility = true;
                room.occupant.pull('313233343536373839303132')
                
                await room.save();

                boarding = await Boarding.findOneAndUpdate(
                    { _id: reservation.boardingId },
                    {
                        $set: { visibility: 'true' }
                    },
                    { new: true }
                ).populate('owner');
            }
            else{
                boarding = await Boarding.findOneAndUpdate(
                    { _id: reservation.boardingId },
                    {
                        $unset: {occupant: '313233343536373839303132'},
                        $set: { visibility: 'true' }
                    },
                    { new: true }
                ).populate('owner');
            }
            


            message = `<p>Dear occupant,</p>
                        <p>Your invitation for <strong>${boarding.boardingName}</strong> has being cancelled by the owner.
                        <p>If this was a mistake, contact the boarding owner at <a href="mailto:${boarding.owner.email}">${boarding.owner.email}</a> or call 0${boarding.owner.phoneNo}.</p>
                        <p>Thank you.</p>
                        <p>Best wishes,<br>
                        The Campus Boarding Team</p>`

            subject = `Important Update: Your Invitation Status at ${boarding.boardingName}`



        }

        

        sendMail(user?.email || reservation.boardingType, message, subject)


        res.status(200).json({message:'Reservation successfully removed'})



    }else{
        res.status(400);
        throw new Error("Reservation Not Found!")
    }

    
});

export { 
    registerBoarding,
    addRoom,
    addOccupant,
    occupantJoin,
    getAllBoardings,
    getAllPublicBoardings,
    getOwnerBoardings,
    getBoardingById,
    getReservationsByBoardingId,
    getReservationsByRoomId,
    getRoomById,
    getOccupantBoarding,
    getPendingApprovalBoardings,
    updateBoardingVisibility,
    updateRoomVisibility,
    approveBoarding,
    approveRoom,
    rejectBoarding,
    rejectRoom,
    updateBoarding,
    updateRoom,
    deleteBoarding,
    deleteRoom,
    deleteReservation
};