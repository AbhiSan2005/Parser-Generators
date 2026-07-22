import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    workspacesList: [],
    activeWorkspace: null,
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
        setWorkspaceLoading: (state, action) => {
            state.loading = action.payload;
        },
        setWorkspaceError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setWorkspacesList,
    setActiveWorkspace,
    updateTabs,
    setActiveTab,
    setWorkspaceLoading,
    setWorkspaceError
} = workspaceSlice.actions;

export default workspaceSlice.reducer;