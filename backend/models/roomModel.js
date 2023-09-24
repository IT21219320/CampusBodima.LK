import mongoose from 'mongoose';

const roomSchema = mongoose.Schema({
    roomNo: {
        type: String,
        required: true
    },
    boardingId: {
        type: String, 
        required: true,
    },
    roomImages: {
        type: [String]
    },
    noOfBeds: {
        type: String, 
        required: true
    },
    noOfCommonBaths: {
        type: String, 
        required: true
    },
    noOfAttachBaths: {
        type: String, 
        required: true
    },
    keyMoney: {
        type: Number
    },
    rent: {
        type: Number
    },
    description: {
        type: String
    },
    occupant: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status:{
        type: String,
        required: true,
        default: 'PendingApproval'
    },
    visibility:{
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

const Room = mongoose.model('Room', roomSchema);

export default Room