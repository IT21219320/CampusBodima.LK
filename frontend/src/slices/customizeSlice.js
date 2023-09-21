import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    sideBar: localStorage.getItem('sideBar') ? JSON.parse(localStorage.getItem('sideBar')) : null,
    confrimPayment: localStorage.getItem('confrimPayment') ? JSON.parse(localStorage.getItem('confrimPayment')) : null
}

const customizeSlice = createSlice({
    name: 'customize',
    initialState,
    reducers: {
        setSideBarStatus: (state, action) => {
            state.sideBar = action.payload;
            localStorage.setItem('sideBar', JSON.stringify(action.payload));
        },
        setConfirmPaymentStatus: (state, action) => {
            state.confrimPayment = action.payload;
            localStorage.setItem('confrimPayment', JSON.stringify(action.payload));
        }
    },
});

export const { setSideBarStatus, setConfirmPaymentStatus } = customizeSlice.actions;

export default customizeSlice.reducer;
