import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import WorkspaceView from './pages/WorkspaceView';

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="workspaces/:workspace_id" element={<WorkspaceView />} />
            </Route>
        </Routes>
    );
}

export default App;