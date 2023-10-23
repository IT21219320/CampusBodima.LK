import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Room from "../models/roomModel.js";
import Boarding from "../models/boardingModel.js"
import Reservation from "../models/reservationModel.js";
import ReservationHistory from "../models/reservationHistory.js";
import toDoPayment from "../models/toDoPayments.js";
import { sendMail } from '../utils/mailer.js';


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
    const owner = await User.findById(boarding.owner);

    if (ViewMyReservation) {

        if (ViewMyReservation.boardingType === "Annex") {
            const myDetails = {
                Id: ViewMyReservation._id,
                paymentStatus: ViewMyReservation.paymentStatus,
                status: ViewMyReservation.status,
                firstName: user.firstName,
                lastName: user.lastName,
                bType: ViewMyReservation.boardingType,
                bAddress: boarding.address,
                bName: boarding.boardingName,
                rent: boarding.rent,
                image: boarding.boardingImages[0],
                Duration: ViewMyReservation.Duration,
                reservedDt: ViewMyReservation.createdAt,
                ownerName: owner.firstName,
                ownerLName: owner.lastName,
                ownerEmail: owner.email,
                ownerPhone: owner.phoneNo,
                ownerAccNo: owner.bankAccNo,
                ownerHoldName: owner.bankAccName,
                ownerBankName: owner.bankName,
                ownerBranch: owner.bankBranch,
            }
            res.status(200).json({
                myDetails,
            })

        } else if (ViewMyReservation.boardingType === "Hostel") {

            const myDetails = {
                Id: ViewMyReservation._id,
                paymentStatus: ViewMyReservation.paymentStatus,
                status: ViewMyReservation.status,
                firstName: user.firstName,
                lastName: user.lastName,
                bType: ViewMyReservation.boardingType,
                bAddress: boarding.address,
                bName: boarding.boardingName,
                rNo: room.roomNo,
                rent: room.rent,
                image: boarding.boardingImages[0],
                Duration: ViewMyReservation.Duration,
                reservedDt: ViewMyReservation.createdAt,
                ownerFName: owner.firstName,
                ownerLName: owner.lastName,
                ownerEmail: owner.email,
                ownerPhone: owner.phoneNo,
                ownerAccNo: owner.bankAccNo,
                ownerHoldName: owner.bankAccName,
                ownerBankName: owner.bankName,
                ownerBranch: owner.bankBranch,
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
                    firstName: occName.firstName,
                    lastName: occName.lastName,
                    email: occName.email,
                    Date: reserveI.createdAt,
                    Duration: reserveI.Duration,
                    bType: boarding.boardingType,

                });

            } else if (boarding.boardingType === "Hostel") {

                const room = await Room.findById(reserveI.roomID);
                console.log(room)

                detailsArry.push({
                    Id: reserveI._id,
                    firstName: occName.firstName,
                    lastName: occName.lastName,
                    email: occName.email,
                    Date: reserveI.createdAt,
                    Duration: reserveI.Duration,
                    RoomNo: room.roomNo,
                    bType: boarding.boardingType,
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
    console.log(reserve.length);
    if (reserve.length > 0) {

        const detailsArry = [];
        for (const reserveI of reserve) {

            const occName = await User.findById(reserveI.occupantID);

            if (boarding.boardingType === "Annex") {

                detailsArry.push({
                    Id: reserveI._id,
                    Name: occName.firstName,
                    Date: reserveI.createdAt,
                    Duration: reserveI.Duration,
                    bType: boarding.boardingType,

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
                    bType: boarding.boardingType,
                });

            }
        }
        res.status(200).json(detailsArry)

    }
    else {

        res.status(200).json({ message: "No Pendings" });
    }

});

//@desc update pending status
//route PUT/api/reservations/aprovePending
// @access  Private - owner

const approvePendingStatus = asyncHandler(async (req, res) => {

    const ReservationId = req.body.reservationId;

    const reservation = await Reservation.findById(ReservationId);
    const Occupant = await User.findById(reservation.occupantID);
    const boarding = await Boarding.findById(reservation.boardingId);

    if (reservation) {

        if (reservation.paymentType === "Cash") {
            reservation.status = 'Approved';
            reservation.paymentStatus = 'Paid';

            const message = `<p><b>Hello ${Occupant.firstName} ${Occupant.lastName},</b><br><br> 
                            
                            Your reservation has been approved.

                            We hope this message finds you in great spirits and eager anticipation for the exciting academic journey that lies ahead.<br/><br/>

                            On behalf of the ${boarding.boardingName} team, it is with immense pleasure that we extend a warm welcome to you as our newest occupant. We are thrilled to have you join our vibrant community, and we trust that your time here will be filled with enriching experiences, lasting friendships, and successful studies.                

                            <br><br>Best wishes,<br>
                            The CampusBodima Team</p>`

            sendMail(Occupant.email, message, "Reservation has been approved");
            res.status(201).json({ message: "Reservation pending successful msg Sent!" });

        } else {
            reservation.status = 'Approved';
            const message = `<p><b>Hello ${Occupant.firstName} ${Occupant.lastName},</b><br><br> 
                            
                            Your reservation has been approved. 

                            We hope this message finds you in great spirits and eager anticipation for the exciting academic journey that lies ahead.<br/><br/>

                            On behalf of the ${boarding.boardingName} team, it is with immense pleasure that we extend a warm welcome to you as our newest occupant. We are thrilled to have you join our vibrant community, and we trust that your time here will be filled with enriching experiences, lasting friendships, and successful studies.                

                            <br><b style="color:red">Please do Your initial payment as soon as possible.</b>

                            <br><br>Best wishes,<br>
                            The CampusBodima Team</p>`

            sendMail(Occupant.email, message, "Reservation has been approved");
            res.status(201).json({ message: "Reservation pending successful mail Sent!" });

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
    const Occupant = await User.findById(reservation.occupantID);

    if (reservation) {
        const deletedPending = await Reservation.findByIdAndDelete(ReservationId);

        if (deletedPending.boardingType === "Annex") {
            const updatedBoarding = await Boarding.findOneAndUpdate(
                { _id: deletedPending.boardingId },
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

        const message = `<p><b>Hello ${Occupant.firstName} ${Occupant.lastName},</b><br><br> 
                            
        We regret to inform you that we are unable to approve your reservation at this time. 
        We understand that this may be disappointing, and we sincerely apologize for any inconvenience this may cause.<br>

        If you have any further questions or if there's anything else we can assist you with, please do not hesitate to reach out to us.
         We are more than happy to provide recommendations or explore alternative options for your accommodation needs.

        <br><br>Best wishes,<br>
        The CampusBodima Team</p>`

        sendMail(Occupant.email, message, "Reservation has been cancelled");
        res.status(201).json({ message: "Reservation pending cancellation mail Sent!" });

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


    const ReservationId = req.body.ReservationId;
    console.log(ReservationId)

    const deletedReservation = await Reservation.findByIdAndDelete(ReservationId);
    console.log(deletedReservation)
    if (deletedReservation) {

        const user = await User.findById(deletedReservation.occupantID);
        const boarding = await Boarding.findById(deletedReservation.boardingId);
        console.log(boarding)

        const cancelledDate = new Date(Date.now()).toLocaleString();
        const reservedDate = new Date(deletedReservation.createdAt).toLocaleString();

        if (deletedReservation.boardingType === "Annex") {

            const reservationHistory = new ReservationHistory({

                boarding: boarding,
                occupant: user,
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
                { _id: deletedReservation.boardingId },
                {
                    $unset: { occupant: deletedReservation.occupantID },
                    $set: { visibility: 'true' }
                },
                { new: true }
            );

            
            //send an confirmation mail
            const refundAmount = boarding.rent * boarding.keyMoney;

            const message = `<p><b>Hello ${user.firstName} ${user.lastName},</b><br><br> 
                            
            We wanted to acknowledge that we have received your recent cancellation request for your reservation at ${boarding.boardingName}. 
            We understand that circumstances can change, and we want to assure you that we've processed your cancellation.<br/><br/>

            The details of your cancellation are as follows:<br><br>
            
            <b>Reservation ID:</b> ${deletedReservation._id}<br/>
            <b>Reserved Date:</b> ${reservedDate}<br/>
            <b>Cancelled Date:</b> ${cancelledDate}<br/>
            <b>Amount to be Refunded:</b> LKR ${refundAmount}<br><br>

            We will refund your key money within 3 months. If you have any questions or concerns regarding the refund, please don't hesitate to reach out to us.

            <br><br>Best wishes,<br>
            The CampusBodima Team</p>`

            sendMail(user.email, message, "Reservation has been cancelled");



        } else if (deletedReservation.boardingType === "Hostel") {

            const room = await Room.findById(deletedReservation.roomID)
            const reservationHistory = new ReservationHistory({

                boarding: boarding,
                room: room,
                occupant: user,
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


            //send an confirmation mail
            const refundAmount = room.rent * room.keyMoney;

            const message = `<p><b>Hello ${user.firstName} ${user.lastName},</b><br><br> 
                            
            We wanted to acknowledge that we have received your recent cancellation request for your reservation at ${boarding.boardingName}. 
            We understand that circumstances can change, and we want to assure you that we've processed your cancellation.<br/><br/>

            The details of your cancellation are as follows:<br><br>
            
            <b>Reservation ID:</b> ${deletedReservation._id}<br/>
            <b>Reserved Date:</b> ${reservedDate}<br/>
            <b>Cancelled Date:</b> ${cancelledDate}<br/>
            <b>Amount to be Refunded:</b> LKR ${refundAmount}<br><br>

            We will refund your key money within 3 months. If you have any questions or concerns regarding the refund, please don't hesitate to reach out to us.

            <br><br>Best wishes,<br>
            The CampusBodima Team</p>`

            sendMail(user.email, message, "Reservation has been cancelled");



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
//route GET/api/reservations/boardings
// @access  Private - owner

const getBoardingByOwnerID = asyncHandler(async (req, res) => {
    const ownerID = req.body.ownerId;

    const ownerBoardings = await Boarding.find({ owner: ownerID });

    if (ownerBoardings) {
        res.status(200).json({
            ownerBoardings,
        })
    }
    else {
        res.status(400);
        throw new Error("No Boardings Available")
    }

});

//@desc get boardings by boardingId
//route GET/api/reservations/deleteReservation
// @access  Private - owner

const getBoardingByBId = asyncHandler(async (req, res) => {
    const bid = req.body.bId;

    const selectedBoarding = await Boarding.findById({ _id: bid });

    if (selectedBoarding) {
        res.status(200).json({
            selectedBoarding,
        })
    }
    else {
        res.status(400);
        throw new Error("No Boarding for this id")
    }

});

//@desc add gender to google accounts
//route POST/api/reservations/updateGender
// @access  Private - occupant

const updateGender = asyncHandler(async (req, res) => {
    const { occId, gender } = req.body;

    const occupant = await User.findById({ _id: occId });

    if (occupant) {

        console.log(occupant.accType)
        /*const updatedGender =  await User.findOneAndUpdate(
            { _id: occId },
            {
                $push: { gender: gender }
            },
            { new: true }
        )*/

        occupant.gender = gender
        occupant.save()
        res.status(200).json(occupant)

    } else {
        res.status(400);
        throw new Error("No User Exist")
    }
})


//@desc get todo payments
//route POST/api/reservations/getToDoByOccId
// @access  Private - occupant

const getToDoByOccId = asyncHandler(async (req, res) => {
    const occId = req.body.occId;

    const Todo = await toDoPayment.find({ owner: occId, status: "paid" });

    if (Todo) {
        res.status(200).json(Todo)
    } else {
        res.status(200).json({
            message: 'Done all the payments',
        })
    }

})

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
    getBoardingByBId,
    updateGender,
    getToDoByOccId,
}