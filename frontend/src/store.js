import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import customizeReducer from "./slices/customizeSlice";
import cartReducer from "./slices/cartSlice";
import { apiSlice } from "./slices/apiSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        customize: customizeReducer,
        cart: cartReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleWare) => getDefaultMiddleWare().concat(apiSlice.middleware),
    devTools: true,
});

export default store;