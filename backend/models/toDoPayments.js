import mongoose from 'mongoose';

const toDoPaymentSchema = mongoose.Schema({
    
    amount : {
        type : String
    },
    
    room: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    occupant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status : {
        type : String,
        default : 'pendding'
    }

    
}, {
    timestamps: true
});

const toDoPayment = mongoose.model('toDoPayment', toDoPaymentSchema);

export default toDoPayment