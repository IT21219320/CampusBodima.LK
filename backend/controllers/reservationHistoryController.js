import asyncHandler from "express-async-handler";
import ReservationHistory from "../models/reservationHistory.js";
import Room from "../models/roomModel.js";
import Boarding from "../models/boardingModel.js";


//@desc get all the reservation history for a particular boarding
//route GET/api/reservationHistory/ReservationHistory
// @access  Private - owner

const getReservationHistory = asyncHandler(async (req, res) => {
    const boardingId = req.body.boardingId;

    const reservationHistory = await ReservationHistory.find({ 'boarding._id': boardingId });

    if (reservationHistory) {
        const history = [];

        for (const his of reservationHistory) {
            if (his.boarding.boardingType == 'Annex') {
                history.push({
                    Id: his._id,
                    occEmail: his.occupant.email,
                    firstName: his.occupant.firstName,
                    lastName: his.occupant.lastName,
                    phoneNo: his.occupant.phoneNo,
                    gender: his.occupant.gender,
                    reservedDate: his.ReservedDate,
                    cancelledDate: his.cancelledDate
                })


            }
            else if (his.boarding.boardingType == 'Hostel') {
                
                history.push({
                    Id: his._id,
                    occEmail: his.occupant.email,
                    firstName: his.occupant.firstName,
                    lastName: his.occupant.lastName,
                    phoneNo: his.occupant.phoneNo,
                    gender: his.occupant.gender,
                    roomNo: his.room.roomNo,
                    reservedDate: his.ReservedDate,
                    cancelledDate: his.cancelledDate
                })
            }
        } res.status(200).json(history);


    }
    else {
        res.status(400);
        throw new Error("No reservation history for this boarding");
    }

});


const myReservationHistory = asyncHandler(async (req, res) => {
    const userID = req.body.userID;
    console.log(userID)
    const reservedHistory = await ReservationHistory.find({ 'occupant._id': userID });
    console.log(reservedHistory)

    if (reservedHistory) {
        res.status(200).json(reservedHistory);
    }
    else {
        res.status(400);
        throw new Error("You haven't done any reservations previously");
    }

});

export {
    getReservationHistory,
    myReservationHistory
}