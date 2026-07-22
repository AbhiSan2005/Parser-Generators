import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    playgroundsList: [],
    activePlayground: null,
    loading: false,
    error: null,
};

const playgroundSlice = createSlice({
    name: 'playground',
    initialState,
    reducers: {
        setPlaygroundsList: (state, action) => {
            state.playgroundsList = action.payload;
        },
        setActivePlayground: (state, action) => {
            state.activePlayground = action.payload;
        },
        setPlaygroundLoading: (state, action) => {
            state.loading = action.payload;
        },
        setPlaygroundError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setPlaygroundsList,
    setActivePlayground,
    setPlaygroundLoading,
    setPlaygroundError
} = playgroundSlice.actions;

export default playgroundSlice.reducer;