import mongoose from 'mongoose';

const menuSchema = new mongooose.Schema({
    name:{type: String, required: true,},
    description: {type:String, required:true},
    price:{type:String, required:true},
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;