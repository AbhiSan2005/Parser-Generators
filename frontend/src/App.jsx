import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import WorkspacesList from './pages/WorkspacesList';
import PlaygroundsList from './pages/PlaygroundsList';
import TabView from './pages/TabView'; // <-- Import the new view

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                
                {/* Workspaces List and Specific Workspace Editor */}
                <Route path="workspaces" element={<WorkspacesList />} />
                <Route path="workspaces/:workspace_id" element={<TabView />} />
                
                {/* Playgrounds List */}
                <Route path="playgrounds" element={<PlaygroundsList />} />
            </Route>
        </Routes>
    );
}

export default App;