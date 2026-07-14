import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentUser: {
        user_id: "b330a9c7",
        username: "Karan Ahuja"
    },
    activeWorkspace: null,
    workspacesList: [],
    loading: false,
    error: null,
};

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setWorkspacesList: (state, action) => {
            state.workspacesList = action.payload;
        },
        setActiveWorkspace: (state, action) => {
            state.activeWorkspace = action.payload;
        },
        updateTabs: (state, action) => {
            if (state.activeWorkspace) {
                state.activeWorkspace.tabs = action.payload;
            }
        },
        setActiveTab: (state, action) => {
            if (state.activeWorkspace) {
                state.activeWorkspace.activeTabId = action.payload;
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setWorkspacesList,
    setActiveWorkspace,
    updateTabs,
    setActiveTab,
    setLoading,
    setError
} = workspaceSlice.actions;

export default workspaceSlice.reducer;