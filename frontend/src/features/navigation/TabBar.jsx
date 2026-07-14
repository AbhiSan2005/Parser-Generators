import { useSelector, useDispatch } from 'react-redux';
import { setActiveTabApi } from '../../api/workspaceClient';
import { setActiveTab } from '../../store/workspaceSlice';
import TabItem from './TabItem';

const TabBar = () => {
    const dispatch = useDispatch();
    const { activeWorkspace } = useSelector((state) => state.workspace);

    if (!activeWorkspace || !activeWorkspace.tabs) return null;

    const handleTabClick = async (tabId) => {
        dispatch(setActiveTab(tabId));
        try {
            await setActiveTabApi(activeWorkspace.workspace_id, tabId);
        } catch (error) {
            console.error("Failed to sync active tab:", error);
        }
    };

    return (
        <div style={{ display: 'flex', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333', overflowX: 'auto' }}>
            {activeWorkspace.tabs.map(tab => (
                <TabItem 
                    key={tab.tab_id} 
                    tab={tab} 
                    isActive={tab.tab_id === activeWorkspace.activeTabId} 
                    onClick={() => handleTabClick(tab.tab_id)} 
                />
            ))}
        </div>
    );
};

export default TabBar;