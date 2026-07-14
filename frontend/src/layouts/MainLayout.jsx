import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../features/navigation/Sidebar';
import { fetchUserWorkspaces } from '../api/workspaceClient';
import { setWorkspacesList } from '../store/workspaceSlice';

const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.workspace);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const response = await fetchUserWorkspaces(currentUser.user_id);
                // Handle both wrapped { data: [...] } or raw array [...]
                const data = response.data || (Array.isArray(response) ? response : []);
                
                if (data) {
                    dispatch(setWorkspacesList(data));
                }
            } catch (error) {
                console.error("Failed to fetch workspaces:", error);
            }
        };
        loadInitialData();
    }, [currentUser.user_id, dispatch]);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <aside style={{ 
                width: isCollapsed ? '70px' : '250px', 
                transition: 'width 0.3s ease', 
                backgroundColor: '#1e1e1e', 
                color: 'white', 
                borderRight: '1px solid #333' 
            }}>
                <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            </aside>
            <main style={{ flexGrow: 1, backgroundColor: '#121212', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;