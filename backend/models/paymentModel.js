import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema({
    paymentType : {
        type : String
    },
    currency : {
        type : String
    },
    amount : {
        type : String
    },
    description: {
        type: String
    },
    room: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    occupant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date : {
        type: String,
    }
    
    
}, {
    timestamps: true
});

const payment = mongoose.model('Payment', paymentSchema);

export default payment