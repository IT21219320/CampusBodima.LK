import mongoose from 'mongoose';
import Boarding from './boardingModel.js';
import User from './userModel.js';
import Room from './roomModel.js';

const paymentSchema = mongoose.Schema({
    
    paymentType : {
        type : String
    },
    amount : {
        type : String
    },
    description: {
        type: String
    },
    payableMonth: {
        type : String
    },
    boarding : {
        type : Boarding.schema,
    },
    room: {
        type: Room.schema,
    },
    owner: {
        type: User.schema,
    },
    occupant: {
        type: User.schema,
    },
    date : {
        type: Date,
        default : Date.now
    },
    credited : {
        type: String,
    },
    debited : {
        type : String,
    }

    
}, {
    timestamps: true
});

const payment = mongoose.model('Payment', paymentSchema);

export default payment