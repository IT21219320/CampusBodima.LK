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
    foodImages:{
        type:[String],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    occupant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status:{
        type: String,
        required: true,
        default: 'Pending'
    },
    date:{
        type:Date,
        default : Date.now
    },
    total:{
        type:String,
    },
});

const Order =  mongoose.model('Order',orderSchema);

export default Order;