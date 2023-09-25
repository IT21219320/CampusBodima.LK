import mongoose from 'mongoose';

const ingredientHistorySchema = mongoose.Schema({
    ingredientName:{
        type: String, 
        required: true,
    },
    quantity: {
        type: String, 
        required: true
    },
    purchaseDate: {
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
}, {
    timestamps: true
});

const IngredientHistory = mongoose.model('IngredientHistory', ingredientHistorySchema);

export default IngredientHistory