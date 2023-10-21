import mongoose from "mongoose";

const itemSchema = mongoose.Schema({
    product:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    total:{
        
    }
})

const orderSchema = mongoose.Schema({
    
    items: {
        type: [itemSchema],
        required: true
    },
    orderNo:{
        type:Number,
        required: true
    },
    boarding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boarding',
        required: true
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
        type:Number,
    },
}, {
    timestamps: true
});

const Order =  mongoose.model('Order',orderSchema);

export default Order;