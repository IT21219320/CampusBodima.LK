import mongoose from 'mongoose';

const boardingSchema = mongoose.Schema({
    boardingName: {
        type: String, 
        required: true
    },
    address: {
        type: String, 
        required: false
    },
    city: {
        type: String
    },
    location: {
        type: Object
    },
    boardingImages: {
        type: [String], 
        required: true
    },
    noOfRooms: {
        type: String,
    },
    noOfCommonBaths: {
        type: String,
    },
    noOfAttachBaths: {
        type: String, 
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
        type: Number
    },
    rent: {
        type: Number
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
    occupant: { //if boarding is an annex, the occupant should be here, else the occupants should be in the room
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status:{
        type: String,
        required: true,
        default: 'Pending'
    },
    visibility:{
        type: Boolean,
        required: true,
        default: false
    },
    inventoryManager:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Boarding = mongoose.model('Boarding', boardingSchema);

export default Boarding