import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    
    product:{
        type:String,
        required:true,
    },
    foodType:{
        type:String,
        required:true,
    },
    quantity:{
        type:String,
        required:true,
    },
    price:{
        type:String,
        required:true,
    }
});

const Order =  mongoose.model('Order' ,orderSchema );

export default orderSchema;