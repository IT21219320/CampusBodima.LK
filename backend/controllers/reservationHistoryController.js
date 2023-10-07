import asyncHandler from "express-async-handler";
import ReservationHistory from "../models/reservationHistory.js";
import Room from "../models/roomModel.js";
import Boarding from "../models/boardingModel.js";


//@desc get all the reservation history for a particular boarding
//route GET/api/reservationHistory/ReservationHistory
// @access  Private - owner

const getReservationHistory = asyncHandler(async (req, res) => {
    const boardingId = req.body.boardingId;

    const reservationHistory = await ReservationHistory.find({ boardingId: boardingId });

    if (reservationHistory) {
        const history = [];

        for (const his of reservationHistory) {
            if (his.boardingType == 'Annex') {
                history.push({
                    Id: his._id,
                    occEmail: his.occupantID.email,
                    firstName: his.occupantID.firstName,
                    lastName: his.occupantID.lastName,
                    phoneNo: his.occupantID.phoneNo,
                    gender: his.occupantID.gender,
                    reservedDate: his.ReservedDate,
                    cancelledDate: his.cancelledDate
                })


            }
            else if (his.boardingType == 'Hostel') {

                const room = await Room.findById(his.roomID);
                
                history.push({
                    Id: his._id,
                    occEmail: his.occupantID.email,
                    firstName: his.occupantID.firstName,
                    lastName: his.occupantID.lastName,
                    phoneNo: his.occupantID.phoneNo,
                    gender: his.occupantID.gender,
                    roomNo: room.roomNo,
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
    const userID = req.body.occId;
    console.log(userID)
    const reservedHistory = await ReservationHistory.find({ 'occupantID._id': userID });

    if (reservedHistory) {
        const returnHistory = [];

        for (const reserveHis of reservedHistory) {


            if (reserveHis.boardingType === 'Annex') {

                const boarding = await Boarding.findById(reserveHis.boardingId);
                console.log(boarding)
                returnHistory.push({
                    Id : reserveHis._id,
                    BoardingName: boarding.boardingName,
                    BoardingType: reserveHis.boardingType,
                    reservedDate: reserveHis.ReservedDate,
                    cancelledDate: reserveHis.cancelledDate
                })

            } else if (reserveHis.boardingType === 'Hostel') {

                const boarding = await Boarding.findById(reserveHis.boardingId);
                const room = await Room.findById(reserveHis.roomID);
                
                returnHistory.push({
                    Id : reserveHis._id,
                    BoardingName: boarding.boardingName,
                    BoardingType: reserveHis.boardingType,
                    RoomNo: room.roomNo,
                    reservedDate: reserveHis.ReservedDate,
                    cancelledDate: reserveHis.cancelledDate
                })
            }

        } res.status(200).json(returnHistory);


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