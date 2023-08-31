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
        type:Date,
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
        type: String, 
        required: false,
    },


});
const Utility = mongoose.model('Utility', utilitySchema );

export default Utility;