import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import WorkspacesList from './pages/WorkspacesList';
import PlaygroundsList from './pages/PlaygroundsList';
import TabView from './pages/TabView';
import PlaygroundView from './pages/PlaygroundView'; // <-- Imported PlaygroundView

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                
                {/* Workspaces List and Specific Workspace Editor */}
                <Route path="workspaces" element={<WorkspacesList />} />
                <Route path="workspaces/:workspace_id" element={<TabView />} />
                
                {/* Playgrounds List and Specific Playground Sandbox */}
                <Route path="playgrounds" element={<PlaygroundsList />} />
                <Route path="playgrounds/:id" element={<PlaygroundView />} />
            </Route>
        </Routes>
    );
}

export default App;