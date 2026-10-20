import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import gsap from 'gsap';
import { setActiveTab, updateTabs } from '../store/workspaceSlice';
import { deleteTab, updateTab } from '../api/workspaceClient'; 
import GoogleAuthButton from './GoogleAuthButton';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const sidebarRef = useRef(null);
    const textRefs = useRef([]);
    const location = useLocation();
    const dispatch = useDispatch();
    
    const { activeWorkspace } = useSelector((state) => state.workspace);
    const isWorkspaceView = location.pathname.includes('/workspaces/') && location.pathname !== '/workspaces';

    const [editingTabId, setEditingTabId] = useState(null);
    const [editTabName, setEditTabName] = useState('');
    const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(true);

    useEffect(() => {
        if (isCollapsed) {
            gsap.to(sidebarRef.current, { width: '80px', duration: 0.3, ease: 'power2.inOut' });
            gsap.to(textRefs.current, { opacity: 0, display: 'none', duration: 0.2 });
        } else {
            gsap.to(sidebarRef.current, { width: '280px', duration: 0.3, ease: 'power2.inOut' });
            gsap.to(textRefs.current, { opacity: 1, display: 'inline-block', duration: 0.3, delay: 0.1 });
        }
    }, [isCollapsed]);

    const addToTextRefs = (el) => {
        if (el && !textRefs.current.includes(el)) {
            textRefs.current.push(el);
        }
    };

    const handleTabClick = (tabId) => {
        dispatch(setActiveTab(tabId)); 
    };

    const handleDeleteTab = async (e, tabId) => {
        e.stopPropagation(); 
        const confirmDelete = window.confirm("Are you sure you want to PERMANENTLY delete this tab?");
        if (!confirmDelete) return;

        try {
            await deleteTab(activeWorkspace.workspace_id, tabId); 
            const updatedTabs = activeWorkspace.tabs.filter(t => t.tab_id !== tabId);
            dispatch(updateTabs(updatedTabs));
            
            if (activeWorkspace.activeTabId === tabId) {
                dispatch(setActiveTab(updatedTabs.length > 0 ? updatedTabs[0].tab_id : null));
            }
        } catch (error) {
            console.error("Failed to delete tab:", error);
            alert("Error deleting tab.");
        }
    };

    const openEditModal = (e, tab) => {
        e.stopPropagation();
        setEditingTabId(tab.tab_id);
        setEditTabName(tab.tabName);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            await updateTab(activeWorkspace.workspace_id, editingTabId, { tabName: editTabName }); 
            const updatedTabs = activeWorkspace.tabs.map(t => 
                t.tab_id === editingTabId ? { ...t, tabName: editTabName } : t
            );
            dispatch(updateTabs(updatedTabs));
            setEditingTabId(null);
            setEditTabName('');
        } catch (error) {
            console.error("Failed to update tab:", error);
            alert("Error updating tab.");
        }
    };

    const navLinkClass = "flex items-center gap-4 py-3 px-4 rounded-lg text-mocha-text hover:bg-mocha-surface0 hover:text-mocha-mauve transition-colors w-full";

    return (
        <div ref={sidebarRef} className="flex flex-col h-screen sticky top-0 bg-mocha-mantle border-r border-mocha-surface0 shrink-0 relative z-50" style={{ width: '280px' }}>
            <div className={`flex items-center p-6 shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <h2 ref={addToTextRefs} className="text-xl font-bold text-mocha-mauve whitespace-nowrap overflow-hidden">
                    Automata IDE
                </h2>
                <button onClick={toggleSidebar} className="text-mocha-subtext0 hover:text-mocha-mauve transition-colors cursor-pointer shrink-0">
                    {isCollapsed ? '☰' : '✖'}
                </button>
            </div>
            
            <nav className="flex flex-col gap-2 px-4 mt-2 shrink-0">
                <Link to="/" className={navLinkClass}>
                    <span className="text-xl">🏠</span> 
                    <span ref={addToTextRefs} className="font-bold whitespace-nowrap">Home</span>
                </Link>
                <Link to="/workspaces" className={navLinkClass}>
                    <span className="text-xl">📁</span> 
                    <span ref={addToTextRefs} className="font-bold whitespace-nowrap">Workspaces</span>
                </Link>
                <Link to="/playgrounds" className={navLinkClass}>
                    <span className="text-xl">🧪</span> 
                    <span ref={addToTextRefs} className="font-bold whitespace-nowrap">Playgrounds</span>
                </Link>
            </nav>

            {isWorkspaceView && activeWorkspace && (
                <div className="mt-8 flex flex-col flex-1 border-t border-mocha-surface0 pt-6 overflow-hidden">
                    {isCollapsed ? (
                        /* Dynamic Initial Logo for Collapsed State */
                        <div 
                            onClick={toggleSidebar}
                            className="flex items-center justify-center w-10 h-10 mx-auto bg-mocha-surface0 text-mocha-mauve rounded-lg font-bold cursor-pointer hover:bg-mocha-surface1 transition-colors shadow-sm"
                            title={`Expand ${activeWorkspace.title || 'Workspace'}`}
                        >
                            {activeWorkspace.title ? activeWorkspace.title.charAt(0).toUpperCase() : 'W'}
                        </div>
                    ) : (
                        /* Expanded State with Title and Tab Tree */
                        <>
                            <div 
                                onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
                                className="flex items-center justify-between cursor-pointer mb-4 px-6 group"
                            >
                                <h4 ref={addToTextRefs} className="text-xs text-mocha-subtext0 font-bold uppercase tracking-wider truncate group-hover:text-mocha-text transition-colors">
                                    {activeWorkspace.title || 'Workspace'}
                                </h4>
                                <span ref={addToTextRefs} className="text-mocha-subtext0 text-xs transition-transform duration-200" style={{ transform: isTabDropdownOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                    ▼
                                </span>
                            </div>
                            
                            {isTabDropdownOpen && (
                                <ul className="space-y-1 overflow-y-auto px-4 pb-6 flex-1 custom-scrollbar">
                                    {activeWorkspace.tabs?.map(tab => {
                                        const isActive = activeWorkspace.activeTabId === tab.tab_id;
                                        return (
                                            <li 
                                                key={tab.tab_id} 
                                                onClick={() => handleTabClick(tab.tab_id)}
                                                className={`group flex items-center justify-between cursor-pointer py-2 px-4 rounded-lg transition-colors ${
                                                    isActive ? 'bg-mocha-surface0 text-mocha-blue' : 'text-mocha-subtext0 hover:bg-mocha-surface0 hover:text-mocha-text'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <span className="text-sm shrink-0">{isActive ? '▶' : '↳'}</span>
                                                    <span ref={addToTextRefs} className="text-sm truncate whitespace-nowrap font-medium">
                                                        {tab.tabName}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                                    <button onClick={(e) => openEditModal(e, tab)} className="text-mocha-subtext0 hover:text-mocha-blue px-1" title="Edit Tab">
                                                        ✏️
                                                    </button>
                                                    <button onClick={(e) => handleDeleteTab(e, tab.tab_id)} className="text-mocha-subtext0 hover:text-mocha-red px-1" title="Delete Tab">
                                                        ✖
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    {activeWorkspace.tabs?.length === 0 && (
                                        <li ref={addToTextRefs} className="text-xs text-mocha-surface1 px-4 italic">No tabs available.</li>
                                    )}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* User Profile / Google Auth Container at bottom */}
            <div className={`mt-auto border-t border-mocha-surface0 p-3 shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
                <GoogleAuthButton compact={isCollapsed} />
            </div>

            {editingTabId && (
                <div className="absolute inset-0 z-50 bg-mocha-crust/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-mocha-base p-6 rounded-xl w-full border border-mocha-surface0">
                        <h3 className="text-mocha-mauve font-bold mb-4">Rename Tab</h3>
                        <form onSubmit={handleSaveEdit}>
                            <input 
                                type="text" 
                                value={editTabName}
                                onChange={(e) => setEditTabName(e.target.value)}
                                className="w-full bg-mocha-mantle border border-mocha-surface0 p-2 rounded text-mocha-text mb-4 outline-none focus:border-mocha-blue"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setEditingTabId(null)} className="px-3 py-1 text-mocha-subtext0">Cancel</button>
                                <button type="submit" className="px-3 py-1 bg-mocha-blue text-mocha-crust rounded font-bold">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
