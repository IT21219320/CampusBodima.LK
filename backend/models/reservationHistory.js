import mongoose from "mongoose";
import User from "./userModel";

const reservationHistorySchema = mongoose.Schema({
    boardingId: {
        type: String, 
        required: true,
    },

    roomID: {
        type: String,
        required: true,
        unique: true
    },

    occupantID: {
        type: User.Schema,
        ref: 'User',
        required: true,
    },

    ReservedDate: {
        type: Date,
        required: true
    },

    cancelledDate: {
        type: Date,
        required: true
    }

},{
    timestamps :true
});

const Reservation =  mongoose.model('reservationHistory' ,reservationHistorySchema );

export default reservationHistorySchema;