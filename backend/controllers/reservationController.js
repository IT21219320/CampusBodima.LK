import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Room from "../models/roomModel.js";
import Boarding from "../models/boardingModel.js"
import Reservation from  "../models/reservationModel.js";
import ReservationHistory from "../models/reservationHistory.js";


//reserve a room
//route post/api/reservations/bookRoom
// @access  Private - occupant

const reserveRoom = asyncHandler(async(req,res) =>{
    const RoomID = req.query.roomID;
    const BoardingId = req.query.boardingId;
    const {userInfo_id , Gender, Duration} = req.body;
    
    const user = await User.findOne({_id:userInfo_id});
    const room =await Room.findById(RoomID);
    const boarding = await Boarding.findById(BoardingId);
    
    const boardingType= boarding.boardingType
    const occupantID = user._id;
   
    var reservationExist =  await Reservation.findOne({occupantID:occupantID});

    if(!reservationExist){

        if(boarding.boardingType == 'Hostel')
        {
            const boardingId= BoardingId;
            console.log(boardingId);
            const roomID = RoomID;
            console.log(boardingId);

            const currentNoOfBeds = parseInt(room.noOfBeds, 10);
            const updatedNoOfBeds = currentNoOfBeds - 1;

            if(currentNoOfBeds>0){
                if(Gender === boarding.gender || boarding.gender==='Any'){
                    const Reserve = await Reservation.create({
                        boardingId,
                        boardingType,
                        roomID,
                        occupantID,
                        Duration,
                    }); 
                    if (Reserve){
        
                        
        
                        const updatedRoom = await Room.findOneAndUpdate(
                            { _id: RoomID },
                            { 
                                
                                $push: { occupant: occupantID },
                                $set: { noOfBeds: toString(updatedNoOfBeds) }
                            },
                            { new: true }
                        ).populate('room');
        
                            res.status(201).json({
                            message: "inserted"
                        }); 
                    }else{
                        res.status(400);
                        throw new Error('problem in inserting');
        
                        }
                    }else{
                        res.status(404);
                        throw new Error('genders are not matching');
                    }
            }else
            {
                res.status(404);
                throw new Error('no beds are available');
            }
            


        }
        else if(boarding.boardingType == 'Annex')
        {
            const boardingId= BoardingId;
            console.log(boardingId)
            if(Gender === boarding.gender || boarding.gender==='Any'){
            const Reserve = await Reservation.create({
                boardingId,
                boardingType,
                occupantID,
                Duration,
            });

                if (Reserve){

                   if(boarding){
                        boarding.occupant = occupantID;
                        console.log(occupantID);
                        await boarding.save();
                        
                    }else 

                        {
                            res.status(404);
                            throw new Error('Boarding not found');
                        }
                        
                        
                    res.status(201).json({
                    message: "inserted to the reservations and inserted occupant to the annex"
                    });    
                     
                }else{
                    res.status(400);
                    throw new Error('problem in inserting');
                } 
            }else{
                res.status(404);
                throw new Error('genders are not matching');
            }
        }

    }else{
        res.status(404);
            throw new Error('you have already reserved');
    }

    
    
});

//@desc update reservation duration
//route PUT/api/reservations/updateDuration
// @access  Private - occupant

const updateDuration = asyncHandler(async(req, res) => {

    const {userInfo_id, Duration} = req.body;

    const reservation = await Reservation.findOne({occupantID:userInfo_id});

    if(reservation){
        reservation.Duration = Duration || reservation.Duration;

        const updatedDuration = await reservation.save();

        res.status(200).json({
            updatedDuration
        })
    }else{
        res.status(404);
        throw new Error('reservation not Found');
    }
});

//@desc get reservation details of a particular occupant
//route GET/api/reservations/myRoom
// @access  Private - occupant

const getMyReservation = asyncHandler(async(req, res) => {
    const userInfo_id = req.body;
    const ViewMyReservation = await Reservation.findOne({occupantID:userInfo_id});

    if(ViewMyReservation){
        res.status(200).json({
            ViewMyReservation,
        })
    userInfo_id}
    else{
        res.status(400);
        throw new Error("you have't done any reservations");
    }

});

//@desc get all reservations of a boarding
//route GET/api/reservations/veiwReservations
// @access  Private - Owner

const getBoardingReservations = asyncHandler(async(req, res) => {
    const boardingId = req.query.boardingId;

    const reserve = await Reservation.find({boardingId:boardingId,status: 'Paid'});

    if(reserve){
        res.status(200).json({
            reserve,
        })
    }
    else{
        res.status(400);
        throw new Error("No reservations for boarding");
    }

});

//@desc get all the pending reservations
//route GET/api/reservations/pending
// @access  Private - owner

const getPendingReservations = asyncHandler(async(req, res) => {
    const boardingId = req.query.boardingId;
    console.log(boardingId)
    const pendingReservation = await Reservation.find({boardingId:boardingId, status: 'Pending'});
    console.log(pendingReservation)
    if(pendingReservation){
        res.status(200).json({
            pendingReservation,
        })
    }
    else{
        res.status(400);
        throw new Error("No pending reservations for this boarding");
    }

});

//@desc update pending status
//route PUT/api/reservations/aprovePending
// @access  Private - owner

const approvePendingStatus = asyncHandler(async(req, res) => {

    const ReservationId = req.query.reservationId;
    
    const reservation = await Reservation.findById(ReservationId);

    if(reservation){
        reservation.status = 'Paid' ;

        const paidReservation = await reservation.save();

        res.status(200).json({
            paidReservation
        })
    }else{
        res.status(404);
        throw new Error('reservation not Found');
    }
});

//@desc delete pending reservation
//route GET/api/reservations/deletePending
// @access  Private - owner
const deletePendingStatus = asyncHandler(async(req, res) => {

    const ReservationId = req.query.reservationId;
    console.log(ReservationId)
    const reservation = await Reservation.findById(ReservationId); 

    if(reservation){
        await Reservation.findOneAndDelete(ReservationId)
        res.status(200).json("Pending reservation Successfully Deleted")
    }
    else{
        res.status(404);
        throw new Error('Reservation not found')

    }

});

//@desc delete reservation and add to the reservation history
//route GET/api/reservations/deleteReservation
// @access  Private - occupant 

const deleteReservation = asyncHandler(async(req, res) => {


    const ReservationId = req.query.reservationId;
    console.log(ReservationId)

    const deletedReservation = await Reservation.findByIdAndDelete(ReservationId); 

    if(deletedReservation){

        res.status(200).json("Reservation Successfully Deleted");

        const user =  await findById(deletedReservation.occupantID);

        const occupantString = JSON.stringify(user)

        if(deleteReservation.boardingType==="Annex")
        {const reservationHistory  = new ReservationHistory({

            boardingId : deleteReservation.boardingId,
            boardingType: deleteReservation.boardingType,
            occupantID: occupantString,
            ReservedDate: deleteReservation.createdAt,
            
          });
        
          await reservationHistory.save();
        
        }else if(deleteReservation.boardingType==="Hostel")

        {const reservationHistory  = new ReservationHistory({

            boardingId : deleteReservation.boardingId,
            boardingType: deleteReservation.boardingType,
            roomID: deleteReservation.roomID,
            occupantID: occupantString,
            ReservedDate: deleteReservation.createdAt,
            
          });
        
          await reservationHistory.save();
        
        }

          
    }
    else{
        res.status(404);
        throw new Error('Reservation not found')

    }

})


export{
    reserveRoom,
    updateDuration,
    getMyReservation,
    getBoardingReservations,
    getPendingReservations,
    approvePendingStatus,
    deletePendingStatus,                                                                                                           
    deleteReservation,
}