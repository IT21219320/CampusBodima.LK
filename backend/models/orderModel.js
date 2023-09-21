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
    },
    orderNo:{
        type:Number,
    },
    /*occupant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },*/
    status:{
        type:Boolean,
    },
    date:{
        type:Date,
    },
    total:{
        type:String,
    },
});

const Order =  mongoose.model('Order',orderSchema);

export default Order;