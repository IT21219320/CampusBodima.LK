import asyncHandler from "express-async-handler";
import ReservationHistory from "../models/reservationHistory.js";


//@desc get all the reservation history for a particular boarding
//route GET/api/reservationHistory/ReservationHistory
// @access  Private - owner

const getReservationHistory = asyncHandler(async(req, res) => {
    const boardingId = req.query.boardingId;
    
    const reservationHistory = await ReservationHistory.find({boardingId:boardingId});
   
    if(reservationHistory){
        res.status(200).json({
            reservationHistory,
        })
    }
    else{
        res.status(400);
        throw new Error("No reservation history for this boarding");
    }

});

export{
    getReservationHistory,
}