import mongoose from "mongoose";
import User from "../models/userModel.js";

const feedbackSchema = mongoose.Schema({
    feedbackId:{
        type:String,
        required:true,
    },


    category:{
      type:String,
      required:true,  
    },


    description:{
        type:String,
        required:true
    },


},{
    timestamps:true
});

const Feedback = mongoose.model('Feedback',feedbackSchema);

export default Feedback;