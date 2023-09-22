import mongoose from "mongoose";

const reservationSchema = mongoose.Schema({
    boardingId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        
    },

    boardingType:{
        type: String,
        required: true,
    },

    roomID: {
        type: mongoose.Schema.Types.ObjectId,
        
    },

    occupantID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    Duration: {
        type: String,
        required:true
    },

    status:{
        type: String,
        required: true,
        default: 'Pending',
    },

},{
    timestamps :true
});

const Reservation =  mongoose.model('Reservation' ,reservationSchema );

export default Reservation;