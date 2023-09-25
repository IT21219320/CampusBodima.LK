import mongoose from "mongoose";

const utilitySchema = mongoose.Schema ({
   

    utilityType: {
        type:String,
        required:true,
    },

    amount: {
        type: Number,
        required: true,
    },

    date:{
        type:String,
        required:true,
    },

    description:{
        type:String,
        required: false,
    },
    boarding:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boarding',
        required: true,
    },
    utilityImage: {
        type: [String] , 
        required: true,
    },
    occupant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    }


},{
    timestamps: true
});
const Utility = mongoose.model('Utility', utilitySchema );

export default Utility;