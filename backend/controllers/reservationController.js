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

    const { userInfo_id, Gender, Duration, BoardingId, RoomID, PaymentType } = req.body;
    console.log("Hi")

    const user = await User.findOne({ _id: userInfo_id });
    const room = await Room.findById(RoomID);
    const boarding = await Boarding.findById(BoardingId);
    console.log(boarding)

    const boardingType = boarding.boardingType
    const occupantID = user._id;
    const paymentType = PaymentType;

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
                        paymentType,

                    });
                    if (Reserve) {

                        const updatedRoom = await Room.findOneAndUpdate(
                            { _id: RoomID },
                            {
                                $push: { occupant: occupantID },
                                $set: { visibility: 'false' }

                            },
                            { new: true }
                        );

                        if (noOfBeds === occupantCount) {
                            const updatedVisibility = await Room.findOneAndUpdate(
                                { _id: RoomID },
                                {
                                    $set: { visibility: 'false' }
                                },
                                { new: true }
                            )

                        }

                        res.status(201).json({
                            message: "inserted"
                        });
                    } else {
                        res.status(200).json({
                            message: "problem in inserting",
                        });

                    }
                } else {
                    res.status(200).json({
                        message: "genders are not matching",
                    });
                }
            } else {
                res.status(200).json({
                    message: "no beds are available",
                });
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
                    paymentType,
                });

                if (Reserve) {

                    if (boarding) {
                        boarding.occupant = occupantID;
                        boarding.visibility = 'false';
                        console.log(occupantID);
                        await boarding.save();

                    } else {
                        res.status(200).json({
                            message: "Boarding not found",
                        });

                    }


                    res.status(200).json({
                        message: "inserted to the reservations and inserted occupant to the annex"
                    });

                } else {
                    res.status(200).json({
                        message: "problem in inserting",
                    });

                }
            } else {
                res.status(200).json({
                    message: "genders are not matching",
                });

            }
        }

    } else {
        res.status(200).json({
            message: "you have already reserved",
        });

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
            updatedDuration,
            message: "Updated successfully",
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

    const user = await User.findById(userInfo_id);
    const boarding = await Boarding.findById(ViewMyReservation.boardingId);
    const room = await Room.findById(ViewMyReservation.roomID);


    if (ViewMyReservation) {

        if (ViewMyReservation.boardingType === "Annex" && ViewMyReservation.status === "Approved") {
            const myDetails = {
                Id: ViewMyReservation._id,
                name: user.firstName,
                bType: ViewMyReservation.boardingType,
                bName: boarding.boardingName,
                Duration: ViewMyReservation.Duration,
                reservedDt: ViewMyReservation.createdAt
            }
            res.status(200).json({
                myDetails,
            })

        } else if (ViewMyReservation.boardingType === "Hostel" && ViewMyReservation.status === "Approved") {

            const myDetails = {
                Id: ViewMyReservation._id,
                name: user.firstName,
                bType: ViewMyReservation.boardingType,
                bName: boarding.boardingName,
                rNo: room.roomNo,
                Duration: ViewMyReservation.Duration,
                reservedDt: ViewMyReservation.createdAt
            }
            res.status(200).json({
                myDetails,
            })

        }




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
    const { boardingId } = req.body;

    const boarding = await Boarding.findById(boardingId);

    const reserve = await Reservation.find({ boardingId: boardingId, status: 'Approved' });

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

        if (reservation.paymentType === "Cash") {
            reservation.status = 'Approved';
            reservation.paymentStatus = 'Paid';

        } else {
            reservation.status = 'Approved';

        }

        const approvedReservation = await reservation.save();

        res.status(200).json({
            approvedReservation
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
        const deletedPending = await Reservation.findByIdAndDelete(ReservationId);

        if (deletedPending.boardingType === "Annex") {
            const updatedBoarding = await Boarding.findOneAndUpdate(
                { _id: deletedPending.BoardingId },
                {
                    $unset: { occupant: deletedPending.occupantID },
                    $set: { visibility: 'true' }
                },
                { new: true }
            );
        }
        else if (deletedPending.boardingType === "Hostel") {
            const updatedRoom = await Room.findOneAndUpdate(
                { _id: deletedPending.roomID },
                {
                    $pull: { occupant: deletedPending.occupantID },
                    $set: { visibility: 'true' }
                },
                { new: true }
            );
        }

        res.status(200).json({
            message: "Pending reservation Successfully Deleted",
        })
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


    const ReservationId = req.body;
    console.log(ReservationId.reservationId)

    const deletedReservation = await Reservation.findByIdAndDelete(ReservationId.reservationId);
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
                {
                    $unset: { occupant: deletedReservation.occupantID },
                    $set: { visibility: 'true' }
                },
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

            const res = await reservationHistory.save();

            if (res) {
                console.log("inserted to history")
            }

            const updatedRoom = await Room.findOneAndUpdate(
                { _id: deletedReservation.roomID },
                {
                    $pull: { occupant: deletedReservation.occupantID },
                    $set: { visibility: 'true' },
                },
                { new: true }
            );



        }
        res.status(200).json({
            message: "Reservation Successfully Deleted",
        });

    }
    else {
        res.status(404);
        throw new Error('Reservation not found')

    }

});

//@desc get boardings by owner ID
//route GET/api/reservations/deleteReservation
// @access  Private - owner

const getBoardingByOwnerID = asyncHandler (async(req, res) => {
    const ownerID =  req.body.ownerId;

    const ownerBoardings = await Boarding.find({owner:ownerID});

    if(ownerBoardings){
        res.status(200).json({
            ownerBoardings,
        })
    }
    else{
        res.status(400);
        throw new Error("No Boardings Available")
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
    getBoardingByOwnerID,
}