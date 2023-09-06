import mongoose from "mongoose";
import User from "../models/userModel.js";

const ticketSchema = mongoose.Schema({
    ticketId:{
        type:String,
        required:true,
    },

    senderId:{
        type:User.schema,
        required:true,
    },

    recieverId:{
        type:User.schema,
        required:true,
    },

    subject:{
        type:String,
        required:true,
    },

    category:{
      type:String,
      required:true,  
    },

    subCategory:{
        type:String,
        required:true,
    },

    description:{
        type:String,
        required:true
    },

    status:{
        type:String,
        default:'Pending'
    },

},{
    timestamps:true
});

const Ticket = mongoose.model('Ticket',ticketSchema);

export default Ticket;