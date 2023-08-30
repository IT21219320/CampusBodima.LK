import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import customizeReducer from "./slices/customizeSlice";
import { apiSlice } from "./slices/apiSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        customize: customizeReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleWare) => getDefaultMiddleWare().concat(apiSlice.middleware),
    devTools: true,
});

export default store;