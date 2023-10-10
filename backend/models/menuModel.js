import mongoose from 'mongoose';

const menuSchema = mongoose.Schema({
    menuName:{
        type: String, 
        required: true,
        unique: true
    },
    boarding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boarding',
        required: true
    },
    foodImages: {
        type: [String], 
    },
    cost: {
        type: String, 
        required: true
    },
    product:{
        type:String,
        required:true,
    },
    foodType:{
        type:String,
        required:true,
    },
    price:{
        type:String,
        required:true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu