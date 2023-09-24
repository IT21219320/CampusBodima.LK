import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Boarding from '../models/boardingModel.js';
import Room from '../models/roomModel.js';
import storage from '../utils/firebaseConfig.js';
import { sendMail } from '../utils/mailer.js'
import { sendSMS } from '../utils/smsSender.js';
import { ref, uploadBytesResumable, deleteObject  } from "firebase/storage";

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

// @desc    Get Boarding by ID
// route    GET /api/boardings/:boardingId
const getBoardingById = asyncHandler(async (req, res) => {
    const boardingId = req.params.boardingId;
    
    const boarding = await Boarding.findById(boardingId).populate({
        path:'room',
        populate: {
            path: 'occupant', 
        },
    });
    
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
        const roomConditions = rooms.map(room => ({ 'room.rent': room.rent }));

        console.log(roomConditions);

        totalRows = await Boarding.countDocuments({
            boardingType,
            ...(status !== 'All' ? { status } : {}),
            ...(food !== 'All' ? { food } : {}),
            ...(utilityBills !== 'All' ? { utilityBills } : {}),
            ...(noOfRooms !== 0 ? { $expr: { $eq: [{ $size: '$room' }, noOfRooms] } } : noOfRooms > 10 ? {$expr: { $gt: [{ $size: '$room' }, 10] }} : {}),
            //...(rent !== 'All' ? (roomConditions.length>0 ? { $and: [{$or: roomConditions }]} : {}) : {}), //gte is greater than or eqal and lte is less than or equal
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
            ...(noOfRooms !== 0 ? { $expr: { $eq: [{ $size: '$room' }, noOfRooms] } } : noOfRooms > 10 ? {$expr: { $gt: [{ $size: '$room' }, 10] }} : {}),
            //...(rent !== 'All' ? (roomConditions.length>0 ? { $or: roomConditions } : {}) : {}), //gte is greater than or eqal and lte is less than or equal
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

// @decs    Get Pending Approval Boardings
// route    GET /api/boardings/pendingApproval
const getPendingApprovalBoardings = asyncHandler(async (req, res) => {
    const page = req.params.page || 0;
    const pageSize = req.params.pageSize;

    const skipCount = (page) * pageSize;

    const boardings = await Boarding.find({status:'PendingApproval'}).populate('room').skip(skipCount).limit(pageSize);

    const totalRows = await Boarding.countDocuments({status:'PendingApproval'}).populate('room').skip(skipCount).limit(pageSize);

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

// @desc    Update boarding status
// route    PUT /api/boardings/approveBoarding/
const approveBoarding = asyncHandler(async (req, res) => {
      const boardingId = req.body.boardingId;

      try {
          let boarding = await Boarding.findById(boardingId).populate('owner');
          boarding.status = "Approved";
          boarding = await boarding.save();
    
          const rooms = await Room.updateMany({boardingId},{ $set: { status: 'Approved' } });
          console.log(rooms);
    
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
            boarding.status = "Incomplete";
            boarding = await boarding.save();
            const rooms = await Room.updateMany({boardingId},{ $set: { status: 'Incomplete' } });

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

export { 
    registerBoarding,
    addRoom,
    getAllBoardings,
    getOwnerBoardings,
    getBoardingById,
    getOccupantBoarding,
    getPendingApprovalBoardings,
    updateBoardingVisibility,
    approveBoarding,
    rejectBoarding,
    updateBoarding,
    deleteBoarding
};