import mongoose from 'mongoose';

const menuSchema = mongoose.Schema({
    menuName:{
        type: String, 
        required: true,
        unique: true
    },
    cost: {
        type: String, 
        required: true
    },
    price: {
        type: String, 
        required: true
    },
    type: {
        type: String, 
        required: true
    },
    boarding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boarding',
        required: true
    },
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu