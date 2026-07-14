import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createWorkspace } from '../../api/workspaceClient';
import { setWorkspacesList } from '../../store/workspaceSlice';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const { currentUser, workspacesList } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleCreateWorkspace = async () => {
        const title = prompt("Enter Workspace Name:", "New Automata Project");
        if (!title) return;

        try {
            const response = await createWorkspace({
                username: currentUser.username,
                user_id: currentUser.user_id,
                title: title,
                description: ""
            });

            // Handle both { data: {...} } or raw object {...}
            const data = response.data || response;

            if (data && data.workspace_id) {
                dispatch(setWorkspacesList([...workspacesList, data]));
                navigate(`/workspaces/${data.workspace_id}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error creating workspace. Check console.");
        }
    };

    return (
        <div style={{ padding: '20px 15px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end' }}>
                <button 
                    onClick={toggleSidebar}
                    style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '20px' }}
                >
                    {isCollapsed ? '☰' : '✖'}
                </button>
            </div>

            <div style={{ textAlign: isCollapsed ? 'center' : 'left' }}>
                <h2 style={{ fontSize: isCollapsed ? '16px' : '24px', transition: 'font-size 0.3s' }}>
                    {isCollapsed ? 'IDE' : 'Automata IDE'}
                </h2>
                {!isCollapsed && <p style={{ fontSize: '12px', color: '#888' }}>{currentUser.username}</p>}
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: isCollapsed ? 'center' : 'flex-start' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }} title="Home">
                    <span style={{ fontSize: '20px' }}>🏠</span>
                    {!isCollapsed && <span>Home</span>}
                </Link>
            </nav>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'flex-start', flexGrow: 1, overflowY: 'auto' }}>
                {!isCollapsed && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ color: '#aaa', textTransform: 'uppercase', fontSize: '12px', margin: 0 }}>Workspaces</h4>
                        {/* THIS IS THE MISSING BUTTON */}
                        <button onClick={handleCreateWorkspace} style={{ background: '#4da6ff', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold' }}>
                            + NEW
                        </button>
                    </div>
                )}
                
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px', width: '100%' }}>
                    {workspacesList.length === 0 ? (
                        !isCollapsed && <li style={{ color: '#666', fontSize: '14px' }}>No workspaces found.</li>
                    ) : (
                        workspacesList.map(ws => (
                            <li key={ws.workspace_id} style={{ marginBottom: '12px', textAlign: isCollapsed ? 'center' : 'left' }}>
                                <Link to={`/workspaces/${ws.workspace_id}`} style={{ color: '#4da6ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }} title={ws.title}>
                                    <span style={{ fontSize: '18px' }}>📁</span>
                                    {!isCollapsed && <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.title}</span>}
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;