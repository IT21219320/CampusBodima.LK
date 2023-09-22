import mongoose from "mongoose";
import User from "../models/userModel.js";

const reservationHistorySchema = mongoose.Schema({
    boardingId: {
        type: String, 
        required: true,
    },

    boardingType:{
        type: String,
        required: true,
    },

    roomID: {
        type: String,
    },

    occupantID: {
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