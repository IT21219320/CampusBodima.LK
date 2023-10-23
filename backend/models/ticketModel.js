import mongoose from "mongoose";
import User from "../models/userModel.js";
import Boarding from "../models/boardingModel.js";

const replySchema = mongoose.Schema({
    ticketId:{
        type:Number,
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

    attachment:{
        type:String
    },

},{
    timestamps:true
});

const ticketSchema = mongoose.Schema({
    ticketId:{
        type:Number,
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

    boardingId:{
        type:Boarding.schema,
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

    attachment:{
        type:String
    },

    reply: {
        type: [replySchema]
    }

},{
    timestamps:true
});

const Ticket = mongoose.model('Ticket',ticketSchema);

export default Ticket;