import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Room from "../models/roomModel.js";
import Boarding from "../models/boardingModel.js"
import Reservation from "../models/reservationModel.js";
import ReservationHistory from "../models/reservationHistory.js";


//reserve a room
//route post/api/reservations/bookRoom
// @access  Private - occupant

const reserveRoom = asyncHandler(async (req, res) => {
    //const RoomID = req.query.roomID;
    //const BoardingId = req.query.boardingId;
    const { userInfo_id, Gender, Duration ,BoardingId, RoomID} = req.body;
    console.log("Hi")
    const user = await User.findOne({ _id: userInfo_id });
    const room = await Room.findById(RoomID);

    const boarding = await Boarding.findById(BoardingId);
    console.log(boarding)
    const boardingType = boarding.boardingType
    const occupantID = user._id;

    var reservationExist = await Reservation.findOne({ occupantID: occupantID });

    if (!reservationExist) {

        if (boarding.boardingType == 'Hostel') {
            const boardingId = BoardingId;
            console.log(boardingId);
            const roomID = RoomID;
            console.log(roomID);

            const noOfBeds = parseInt(room.noOfBeds);
            console.log(noOfBeds);
            console.log(room.occupant)
            const occupantCount = room.occupant.length;
            console.log(occupantCount);
            if (noOfBeds > occupantCount) {
                if (Gender === boarding.gender || boarding.gender === 'Any') {
                    const Reserve = await Reservation.create({
                        boardingId,
                        boardingType,
                        roomID,
                        occupantID,
                        Duration,
                    });
                    if (Reserve) {

                        const updatedRoom = await Room.findOneAndUpdate(
                            { _id: RoomID },
                            {
                                $push: { occupant: occupantID }
                            },
                            { new: true }
                        );

                        res.status(201).json({
                            message: "inserted"
                        });
                    } else {
                        res.status(400);
                        throw new Error('problem in inserting');

                    }
                } else {
                    res.status(404);
                    throw new Error('genders are not matching');
                }
            } else {
                res.status(404);
                throw new Error('no beds are available');
            }



        }
        else if (boarding.boardingType == 'Annex') {
            const boardingId = BoardingId;
            console.log(boardingId)
            if (Gender === boarding.gender || boarding.gender === 'Any') {
                const Reserve = await Reservation.create({
                    boardingId,
                    boardingType,
                    occupantID,
                    Duration,
                });

                if (Reserve) {

                    if (boarding) {
                        boarding.occupant = occupantID;
                        console.log(occupantID);
                        await boarding.save();

                    } else {
                        res.status(404);
                        throw new Error('Boarding not found');
                    }


                    res.status(201).json({
                        message: "inserted to the reservations and inserted occupant to the annex"
                    });

                } else {
                    res.status(400);
                    throw new Error('problem in inserting');
                }
            } else {
                res.status(404);
                throw new Error('genders are not matching');
            }
        }

    } else {
        res.status(404);
        throw new Error('you have already reserved');
    }



});

//@desc update reservation duration
//route PUT/api/reservations/updateDuration
// @access  Private - occupant

const updateDuration = asyncHandler(async (req, res) => {

    const { userInfo_id, Duration } = req.body;

    const reservation = await Reservation.findOne({ occupantID: userInfo_id });

    if (reservation) {
        reservation.Duration = Duration || reservation.Duration;

        const updatedDuration = await reservation.save();

        res.status(200).json({
            updatedDuration
        })
    } else {
        res.status(404);
        throw new Error('reservation not Found');
    }
});

//@desc get reservation details of a particular occupant
//route GET/api/reservations/myRoom
// @access  Private - occupant

const getMyReservation = asyncHandler(async (req, res) => {
    const userInfo_id = req.body;
    const ViewMyReservation = await Reservation.findOne({ occupantID: userInfo_id });

    if (ViewMyReservation) {
        res.status(200).json({
            ViewMyReservation,
        })
        userInfo_id
    }
    else {
        res.status(400);
        throw new Error("you have't done any reservations");
    }

});

//@desc get all reservations of a boarding
//route GET/api/reservations/veiwReservations
// @access  Private - Owner

const getBoardingReservations = asyncHandler(async (req, res) => {
    const {boardingId} = req.body;

    const boarding = await Boarding.findById(boardingId);

    const reserve = await Reservation.find({ boardingId: boardingId, status: 'Paid' });

    if (reserve) {

        const detailsArry = [];
        for (const reserveI of reserve) {

            const occName = await User.findById(reserveI.occupantID);

            if (boarding.boardingType === "Annex") {

                detailsArry.push({
                    Id: reserveI._id,
                    Name: occName.firstName,
                    Date: reserveI.createdAt,
                    Duration: reserveI.Duration,

                });

            } else if (boarding.boardingType === "Hostel") {

                const room = await Room.findById(reserveI.roomID);
                console.log(room)

                detailsArry.push({
                    Id: reserveI._id,
                    Name: occName.firstName,
                    Date: reserveI.createdAt,
                    Duration: reserveI.Duration,
                    RoomNo: room.roomNo,
                });

            }
        }
        res.status(200).json(detailsArry)

    }
    else {
        res.status(400);
        throw new Error("No reservations for boarding");
    }

});

//@desc get all the pending reservations
//route GET/api/reservations/pending
// @access  Private - owner

const getPendingReservations = asyncHandler(async (req, res) => {
    const boardingId = req.body.boardingId;

    const boarding = await Boarding.findById(boardingId);

    const reserve = await Reservation.find({ boardingId: boardingId, status: 'Pending' });

    if (reserve) {

        const detailsArry = [];
        for (const reserveI of reserve) {

            const occName = await User.findById(reserveI.occupantID);

            if (boarding.boardingType === "Annex") {

                detailsArry.push({
                    Id: reserveI._id,
                    Name: occName.firstName,
                    Date: reserveI.createdAt,
                    Duration: reserveI.Duration,

                });

            } else if (boarding.boardingType === "Hostel") {

                const room = await Room.findById(reserveI.roomID);
                console.log(room)

                detailsArry.push({
                    Id: reserveI._id,
                    Name: occName.firstName,
                    Date: reserveI.createdAt,
                    Duration: reserveI.Duration,
                    RoomNo: room.roomNo,
                });

            }
        }
        res.status(200).json(detailsArry)

    }
    else {
        res.status(400);
        throw new Error("No pending reservations for boarding");
    }

});

//@desc update pending status
//route PUT/api/reservations/aprovePending
// @access  Private - owner

const approvePendingStatus = asyncHandler(async (req, res) => {

    const ReservationId = req.body.reservationId;

    const reservation = await Reservation.findById(ReservationId);

    if (reservation) {
        reservation.status = 'Paid';

        const paidReservation = await reservation.save();

        res.status(200).json({
            paidReservation
        })
    } else {
        res.status(404);
        throw new Error('reservation not Found');
    }
});

//@desc delete pending reservation
//route GET/api/reservations/deletePending
// @access  Private - owner
const deletePendingStatus = asyncHandler(async (req, res) => {

    const ReservationId = req.body.reservationId;
    console.log(ReservationId)
    const reservation = await Reservation.findById(ReservationId);

    if (reservation) {
        await Reservation.findByIdAndDelete(ReservationId)
        res.status(200).json("Pending reservation Successfully Deleted")
    }
    else {
        res.status(404);
        throw new Error('Reservation not found')

    }

});

//@desc delete reservation and add to the reservation history
//route GET/api/reservations/deleteReservation
// @access  Private - occupant 

const deleteReservation = asyncHandler(async (req, res) => {


    const ReservationId = req.query.reservationId;

    const deletedReservation = await Reservation.findByIdAndDelete(ReservationId);
    console.log(deletedReservation)
    if (deletedReservation) {

        const user = await User.findById(deletedReservation.occupantID);

        if (deletedReservation.boardingType === "Annex") {
            console.log(deletedReservation.boardingId);

            const reservationHistory = new ReservationHistory({

                boardingId: deletedReservation.boardingId,
                boardingType: deletedReservation.boardingType,
                occupantID: user,
                ReservedDate: deletedReservation.createdAt,

            });

            console.log(reservationHistory)

            const res = await reservationHistory.save();
            if (res) {
                console.log("inserted to history")
            }
            console.log("after inserting in to table")
            console.log(deletedReservation.occupantID)
            const updatedBoarding = await Boarding.findOneAndUpdate(
                { _id: deletedReservation.BoardingId },
                { $pull: { occupant: deletedReservation.occupantID } },
                { new: true }
            );

        } else if (deletedReservation.boardingType === "Hostel") {
            const reservationHistory = new ReservationHistory({

                boardingId: deletedReservation.boardingId,
                boardingType: deletedReservation.boardingType,
                roomID: deletedReservation.roomID,
                occupantID: user,
                ReservedDate: deletedReservation.createdAt,

            });

            await reservationHistory.save();

        }
        res.status(200).json("Reservation Successfully Deleted");

    }
    else {
        res.status(404);
        throw new Error('Reservation not found')

    }

});


export {
    reserveRoom,
    updateDuration,
    getMyReservation,
    getBoardingReservations,
    getPendingReservations,
    approvePendingStatus,
    deletePendingStatus,
    deleteReservation,
}