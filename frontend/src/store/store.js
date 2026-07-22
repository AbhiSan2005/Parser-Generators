import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import workspaceReducer from './workspaceSlice';
import playgroundReducer from './playgroundSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        workspace: workspaceReducer,
        playground: playgroundReducer,
    },
});