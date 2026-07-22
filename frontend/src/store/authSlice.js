import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentUser: {
        user_id: "b330a9c7",
        username: "Karan Ahuja"
    }
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSessionUser: (state, action) => {
            state.currentUser = action.payload;
        }
    }
});

export const { setSessionUser } = authSlice.actions;
export default authSlice.reducer;