import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    // This state controls whether the sidebar is open or closed globally
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="flex min-h-screen w-full bg-mocha-base font-mono">
            {/* The Sidebar Component */}
            <Sidebar 
                isCollapsed={isCollapsed} 
                toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
            />
            
            {/* The Main Content Area */}
            <main className="flex-grow flex flex-col min-h-screen w-full overflow-y-auto">
                {/* Outlet renders the current route's component (e.g., Home) */}
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;