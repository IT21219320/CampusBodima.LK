import mongoose from "mongoose";

const reservationSchema = mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    ReservedDate: {
        type: Date,
        required: true
    },

    Duration: {
        type: Date,
        required:true
    },

    DurationUpdatedAt: {
        type: Date,
    }

},{
    timestamps :true
});

const Reservation =  mongoose.model('Reservation' ,reservationSchema );

export default Reservation;