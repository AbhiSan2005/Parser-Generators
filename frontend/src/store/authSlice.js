import { createSlice } from '@reduxjs/toolkit';

const getInitialUser = () => {
    try {
        const stored = localStorage.getItem('dfa_user');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to parse stored user:", e);
    }
    return {
        user_id: "b330a9c7",
        username: "Guest User",
        email: "",
        avatar: "",
        isGuest: true
    };
};

const initialUser = getInitialUser();

const initialState = {
    currentUser: initialUser,
    isAuthenticated: !initialUser.isGuest
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSessionUser: (state, action) => {
            state.currentUser = {
                ...action.payload,
                isGuest: false
            };
            state.isAuthenticated = true;
            localStorage.setItem('dfa_user', JSON.stringify(state.currentUser));
        },
        logoutUser: (state) => {
            const guest = {
                user_id: "b330a9c7",
                username: "Guest User",
                email: "",
                avatar: "",
                isGuest: true
            };
            state.currentUser = guest;
            state.isAuthenticated = false;
            localStorage.removeItem('dfa_user');
        }
    }
});

export const { setSessionUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
