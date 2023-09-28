import mongoose from 'mongoose';

const cardDetailsSchema = mongoose.Schema({
    
    occupant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cardName : {
        type : String,
        require:true,
    },
    cardNumber : {
        type : Object,
        require: true
    },
    expireDate : {
        type : String,
        require : true,
    },
    cvv : {
        type : Object,
        require: true
    }
});

const cardDetails = mongoose.model('cardDetails', cardDetailsSchema);

export default cardDetails