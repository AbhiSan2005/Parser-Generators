import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkspacesList } from '../store/workspaceSlice';
import { getUserWorkspaces, createWorkspace, deleteWorkspace, updateWorkspace } from '../api/workspaceClient';

const WorkspacesList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { currentUser } = useSelector((state) => state.auth);
    const { workspacesList, loading } = useSelector((state) => state.workspace);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('CREATE');
    const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '' });

    const safeWorkspaces = Array.isArray(workspacesList) ? workspacesList : [];

    useEffect(() => {
        fetchWorkspaces();
    }, [currentUser.user_id]);

    const fetchWorkspaces = async () => {
        try {
            const data = await getUserWorkspaces(currentUser.user_id);
            const extracted = Array.isArray(data) ? data : (data?.workspaces || data?.data || []);
            dispatch(setWorkspacesList(extracted));
        } catch (error) {
            console.error("Failed to fetch workspaces:", error);
            dispatch(setWorkspacesList([]));
        }
    };

    const openCreateModal = () => {
        setModalMode('CREATE');
        setFormData({ title: '', description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (e, ws) => {
        e.stopPropagation();
        setModalMode('EDIT');
        setActiveWorkspaceId(ws.workspace_id);
        setFormData({ title: ws.title, description: ws.description });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ title: '', description: '' });
        setActiveWorkspaceId(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (modalMode === 'CREATE') {
                const newWs = await createWorkspace({
                    username: currentUser.username,
                    user_id: currentUser.user_id,
                    title: formData.title || 'Untitled Workspace',
                    description: formData.description
                });
                const workspaceData = newWs?.data || newWs;
                dispatch(setWorkspacesList([...safeWorkspaces, workspaceData]));
            } else if (modalMode === 'EDIT') {
                const updatedWs = await updateWorkspace(activeWorkspaceId, {
                    title: formData.title || 'Untitled Workspace',
                    description: formData.description
                });
                
                const updatedData = updatedWs?.data || updatedWs;
                
                const newList = safeWorkspaces.map(ws => 
                    ws.workspace_id === activeWorkspaceId ? { ...ws, title: updatedData.title, description: updatedData.description } : ws
                );
                dispatch(setWorkspacesList(newList));
            }
            closeModal();
        } catch (error) {
            console.error(`Error during workspace ${modalMode}:`, error);
            alert(`Failed to ${modalMode.toLowerCase()} workspace.`);
        }
    };

    const handleDelete = async (e, workspaceId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this workspace permanently?")) return;

        try {
            await deleteWorkspace(workspaceId);
            dispatch(setWorkspacesList(safeWorkspaces.filter(ws => ws.workspace_id !== workspaceId)));
        } catch (error) {
            console.error("Error deleting workspace:", error);
            alert("Failed to delete workspace.");
        }
    };

    return (
        <div className="p-10 w-full flex-grow flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-mocha-surface0 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-mocha-mauve">Workspaces</h1>
                    <p className="text-mocha-subtext0 mt-2">Manage your automata graph environments.</p>
                </div>
                <button 
                    onClick={openCreateModal} 
                    className="bg-mocha-mauve text-mocha-crust px-5 py-2.5 rounded-lg font-bold hover:bg-opacity-90 transition cursor-pointer flex items-center gap-2"
                >
                    <span className="text-xl">+</span> New Workspace
                </button>
            </div>

            {loading ? (
                <div className="text-mocha-subtext0 text-center mt-10">Loading your environments...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {safeWorkspaces.map(ws => (
                        <div 
                            key={ws.workspace_id} 
                            onClick={() => navigate(`/workspaces/${ws.workspace_id}`)}
                            className="bg-mocha-mantle border border-mocha-surface0 hover:border-mocha-mauve transition-all duration-200 rounded-xl cursor-pointer flex flex-col h-64 shadow-sm relative group overflow-hidden"
                        >
                            {/* Increased image banner height to h-32 */}
                            <div className="h-34 w-full bg-mocha-crust relative overflow-hidden border-b border-mocha-surface0 shrink-0">
                                <img 
                                    src={`https://api.dicebear.com/10.x/shapes/svg?seed=${ws.workspace_id}&backgroundColor=1e1e2e,181825,313244&shape1Color=cba6f7,89b4fa,a6e3a1`} 
                                    alt="Workspace Pattern" 
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button 
                                        onClick={(e) => openEditModal(e, ws)}
                                        className="p-1.5 text-mocha-subtext0 hover:text-mocha-blue bg-mocha-surface0/90 rounded backdrop-blur-sm transition"
                                        title="Edit Metadata"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, ws.workspace_id)}
                                        className="p-1.5 text-mocha-subtext0 hover:text-mocha-red bg-mocha-surface0/90 rounded backdrop-blur-sm transition"
                                        title="Delete Workspace"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            
                            {/* Tightened Card Body */}
                            <div className="p-4 flex-grow flex flex-col overflow-hidden">
                                <h2 className="text-lg font-bold text-mocha-text mb-1 truncate">
                                    {ws.title || 'Untitled Workspace'}
                                </h2>
                                {/* Forced description to exactly 2 lines */}
                                <p className="text-mocha-subtext0 text-sm line-clamp-2 flex-grow">
                                    {ws.description || 'No description provided.'}
                                </p>
                                
                                <div className="mt-2 pt-2 border-t border-mocha-surface0 flex justify-between items-center text-xs text-mocha-surface2 font-mono shrink-0">
                                    <span>ID: {ws.workspace_id.substring(0, 8)}</span>
                                    <span>{ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : 'New'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {safeWorkspaces.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-mocha-surface1 rounded-xl text-mocha-subtext0">
                            <span className="text-4xl mb-4">📭</span>
                            <p>No workspaces found. Create your first environment.</p>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-mocha-crust/80 backdrop-blur-sm p-4">
                    <div className="bg-mocha-base border border-mocha-surface0 p-8 rounded-xl w-full max-w-md shadow-2xl transform transition-all">
                        <h2 className="text-2xl font-bold text-mocha-mauve mb-6">
                            {modalMode === 'CREATE' ? 'Create New Workspace' : 'Edit Workspace'}
                        </h2>
                        
                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-mocha-subtext0 mb-1">Title</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-mocha-mantle border border-mocha-surface0 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-mauve transition-colors"
                                    placeholder="e.g., Turing Machine Sandbox"
                                    autoFocus
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-mocha-subtext0 mb-1">Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-mocha-mantle border border-mocha-surface0 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-mauve transition-colors min-h-[100px] resize-none"
                                    placeholder="Optional description of this environment..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded-lg text-mocha-subtext0 hover:bg-mocha-surface0 transition-colors font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-2 rounded-lg bg-mocha-mauve text-mocha-crust font-bold hover:bg-opacity-90 transition-colors cursor-pointer"
                                >
                                    {modalMode === 'CREATE' ? 'Create' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspacesList;