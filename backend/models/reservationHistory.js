import mongoose from "mongoose";
import User from "../models/userModel.js";
import Boarding from "./boardingModel.js";
import Room from "./roomModel.js";

const reservationHistorySchema = mongoose.Schema({
    
    boarding:{
        type: Boarding.schema,
        required: true,
    },

    room: {
        type: Room.schema,
    },

    occupant: {
        type: User.schema,
        required: true,
    },

    ReservedDate: {
        type: Date,
        required: true
    },

    cancelledDate: {
        type: Date,
        required: true,
        default: Date.now,
    }

},{
    timestamps :true
});

const ReservationHistory =  mongoose.model('ReservationHistory' ,reservationHistorySchema );

export default ReservationHistory;