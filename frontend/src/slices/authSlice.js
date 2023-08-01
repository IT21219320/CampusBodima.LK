import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
    resetSession: localStorage.getItem('resetSession') ? JSON.parse(localStorage.getItem('resetSession')) : null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUserInfo: (state, action) => {
            state.userInfo = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
        },
        clearUserInfo: (state, action) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo');
        },
        createResetSession: (state, action) => {
            state.resetSession = action.payload;
            localStorage.setItem('resetSession', JSON.stringify(action.payload));
        },
        destroyResetSession: (state, action) => {
            state.resetSession = null;
            localStorage.removeItem('resetSession');
        },
    },
});

export const { setUserInfo, clearUserInfo, createResetSession, destroyResetSession } = authSlice.actions;

export default authSlice.reducer;
