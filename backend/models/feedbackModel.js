import mongoose from "mongoose";
import User from "../models/userModel.js";

const feedbackSchema = mongoose.Schema({
    feedbackId:{
        type:String,
        required:true,
    },
    senderId:{
        type:User.schema,
        required:true,
    },
   
    
    boardingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boarding',
        required: true
    },
    
    
    category:{
      type:String,
      required:true,  
    },


    description:{
        type:String,
        required:true
    },
    
     rating: {
        type: String,
        required: true,
         
    },



},{
    timestamps:true
});

const Feedback = mongoose.model('Feedback',feedbackSchema);

export default Feedback;