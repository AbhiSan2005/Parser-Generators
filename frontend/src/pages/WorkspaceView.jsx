import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkspaceById, createTab } from '../api/workspaceClient'; 
import { setActiveWorkspace, setLoading, setError } from '../store/workspaceSlice';
import TabBar from '../features/navigation/TabBar';
import TabOrchestrator from '../features/workspace/TabOrchestrator';
import BottomInputBar from '../features/controls/BottomInputBar'; 

const WorkspaceView = () => {
    const { workspace_id } = useParams();
    const dispatch = useDispatch();
    const { activeWorkspace, loading, error } = useSelector((state) => state.workspace);

    useEffect(() => {
        const loadWorkspace = async () => {
            dispatch(setLoading(true));
            try {
                const response = await fetchWorkspaceById(workspace_id);
                
                // Flexibly handle the backend response format
                const data = response.data || response;

                if (data && data.workspace_id) {
                    dispatch(setActiveWorkspace(data));
                } else {
                    dispatch(setError("Failed to load workspace data."));
                }
            } catch (err) {
                dispatch(setError(err.message));
            } finally {
                dispatch(setLoading(false));
            }
        };

        if (workspace_id) {
            loadWorkspace();
        }
    }, [workspace_id, dispatch]);

    const handleCreateTab = async () => {
        const tabName = prompt("Enter Tab Name (e.g., Q1_Regex):", "New Regex");
        if (!tabName) return;
        
        try {
            const response = await createTab(workspace_id, { tabName, language_type: "REGULAR" });
            const data = response.data || response;
            if (data && data.workspace_id) {
                dispatch(setActiveWorkspace(data));
            }
        } catch (err) {
            console.error("Failed to create tab");
        }
    };

    if (loading) return <div style={{ padding: '20px', color: '#aaa', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading Workspace...</div>;
    if (error) return <div style={{ padding: '20px', color: '#ff4d4d', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Error: {error}</div>;
    if (!activeWorkspace) return <div style={{ padding: '20px', color: '#aaa', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Workspace not found.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            
            <div style={{ display: 'flex', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333' }}>
                <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <TabBar />
                </div>
                {/* NEW TAB BUTTON */}
                <button onClick={handleCreateTab} style={{ padding: '0 15px', backgroundColor: '#2d2d2d', color: '#4da6ff', border: 'none', borderLeft: '1px solid #333', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>
                    +
                </button>
            </div>
            
            <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
                <TabOrchestrator />
            </div>

            {/* THE TESTING CONSOLE */}
            <BottomInputBar />
        </div>
    );
};

export default WorkspaceView;