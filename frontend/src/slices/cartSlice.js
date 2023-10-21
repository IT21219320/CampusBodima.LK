import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    cart: localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [],
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartItems: (state, action) => {
            state.cart = action.payload;
            localStorage.setItem('cart', JSON.stringify(action.payload));
        },
        clearCartDetails: (state, action) => {
            state.cart = [];
            localStorage.removeItem('cart');
        }
    },
});

export const { setCartItems, clearCartDetails } = cartSlice.actions;

export default cartSlice.reducer;
