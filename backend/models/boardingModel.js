import mongoose from 'mongoose';

const boardingSchema = mongoose.Schema({
    boardingName: {
        type: String, 
        required: true,
        unique: true
    },
    address: {
        type: String, 
        required: false
    },
    city: {
        type: String
    },
    location: {
        type: String
    },
    boardingImages: {
        type: [String], 
        required: true
    },
    noOfRooms: {
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
    facilities: {
        type: [String]
    },
    utilityBills: {
        type: Boolean,
        default: 0
    },
    food: {
        type: Boolean,
        default: 0
    },
    phoneNo: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        required: true
    },
    boardingType: {
        type: String, 
        required: true,
    },
    rules: {
        type: [String]
    },
    keyMoney: {
        type: String
    },
    rent: {
        type: String
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
    status:{
        type: String,
        required: true,
        default: 'pending'
    }
}, {
    timestamps: true
});

const Boarding = mongoose.model('Boarding', boardingSchema);

export default Boarding