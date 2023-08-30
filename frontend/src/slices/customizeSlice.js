import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    sideBar: localStorage.getItem('sideBar') ? JSON.parse(localStorage.getItem('sideBar')) : null
}

const customizeSlice = createSlice({
    name: 'customize',
    initialState,
    reducers: {
        setSideBarStatus: (state, action) => {
            state.sideBar = action.payload;
            localStorage.setItem('sideBar', JSON.stringify(action.payload));
        },
    },
});

export const { setSideBarStatus } = customizeSlice.actions;

export default customizeSlice.reducer;
