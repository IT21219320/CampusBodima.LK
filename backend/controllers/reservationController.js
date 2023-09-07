import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Room from "../models/roomModel.js";
import Boarding from "../models/boardingModel.js"
import Reservation from  "../models/reservationModel.js";

//reserve a room
//route post/api/reservations/bookNow

const reserveRoom = asyncHandler(async(req,res) =>{
    const {RoomId} = req.query.RoomId;


    const {Gender, Duration} = req.body;
    const user = await User.findOne(req.user._id);
    const room = await Room.findOne(RoomId);
    const boarding = await Boarding.findOne(room.boardingId);

    const boardingId = room.boardingId;
    const occupantID =user._id;

    if(Gender === boarding.gender){
        const Reserve = await Reservation.create({
            boardingId,
            RoomId,
            occupantID,
            Duration,
        }); 

        if (Reserve){
            
            res.status(201).json({
                message: "inserted"
            }); 
        }else{
            res.status(400);
        }
    
    }else{
        res.status(404);
        throw new Error('genders are not matching');
    }
    
})

export{
    reserveRoom,
}