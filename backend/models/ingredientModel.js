import mongoose from 'mongoose';

const ingredientSchema = mongoose.Schema({
    ingredientName:{
        type: String, 
        required: true,
    },
    quantity: {
        type: String, 
        required: true
    },
    measurement: {
        type: String, 
        required: true
    },
    purchaseDate: {
        type: String, 
        required: true
    }, 
    boarding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boarding',
        required: true
    },
    sortField: {
        type: Number,
        default: 0
    }
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

export default Ingredient