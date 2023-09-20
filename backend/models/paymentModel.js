import mongoose from 'mongoose';

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
    date : {
        type: Date,
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