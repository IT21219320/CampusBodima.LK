import mongoose from 'mongoose';

const menuSchema = mongoose.Schema({
    boarding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boarding',
        required: true
    },
    product:{
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
    foodImage:{
        type:String,
    }
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu