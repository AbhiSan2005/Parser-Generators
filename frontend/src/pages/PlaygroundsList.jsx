import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setPlaygroundsList } from '../store/playgroundSlice';
import { getUserPlaygrounds, createPlayground, deletePlayground, updatePlayground } from '../api/playgroundClient';

const PlaygroundsList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { currentUser } = useSelector((state) => state.auth);
    const { playgroundsList, loading } = useSelector((state) => state.playground);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('CREATE');
    const [activePlaygroundId, setActivePlaygroundId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const safePlaygrounds = Array.isArray(playgroundsList) ? playgroundsList : [];

    useEffect(() => {
        fetchPlaygrounds();
    }, [currentUser.user_id]);

    const fetchPlaygrounds = async () => {
        try {
            const data = await getUserPlaygrounds(currentUser.user_id);
            dispatch(setPlaygroundsList(data));
        } catch (error) {
            console.error("Failed to fetch playgrounds:", error);
            dispatch(setPlaygroundsList([]));
        }
    };

    const openCreateModal = () => {
        setModalMode('CREATE');
        setFormData({ name: '', description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (e, pg) => {
        e.stopPropagation();
        setModalMode('EDIT');
        setActivePlaygroundId(pg.playground_id);
        setFormData({ name: pg.name, description: pg.description });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', description: '' });
        setActivePlaygroundId(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (modalMode === 'CREATE') {
                const newPg = await createPlayground({
                    user_id: currentUser.user_id,
                    name: formData.name || 'Untitled Parser Playground',
                    description: formData.description
                });
                dispatch(setPlaygroundsList([...safePlaygrounds, newPg]));
            } else if (modalMode === 'EDIT') {
                const updatedPg = await updatePlayground(activePlaygroundId, {
                    name: formData.name || 'Untitled Parser Playground',
                    description: formData.description
                });
                
                const newList = safePlaygrounds.map(pg => 
                    pg.playground_id === activePlaygroundId ? { ...pg, name: updatedPg.name, description: updatedPg.description } : pg
                );
                dispatch(setPlaygroundsList(newList));
            }
            closeModal();
        } catch (error) {
            console.error(`Error during playground ${modalMode}:`, error);
            alert(`Failed to ${modalMode.toLowerCase()} playground.`);
        }
    };

    const handleDelete = async (e, playgroundId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this playground permanently?")) return;

        try {
            await deletePlayground(playgroundId);
            dispatch(setPlaygroundsList(safePlaygrounds.filter(pg => pg.playground_id !== playgroundId)));
        } catch (error) {
            console.error("Error deleting playground:", error);
            alert("Failed to delete playground.");
        }
    };

    return (
        <div className="p-10 w-full flex-grow flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-mocha-surface0 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-mocha-mauve">Playgrounds</h1>
                    <p className="text-mocha-subtext0 mt-2">Generate and compile LL(1) / SLR(1) parsers.</p>
                </div>
                <button 
                    onClick={openCreateModal} 
                    className="bg-mocha-mauve text-mocha-crust px-5 py-2.5 rounded-lg font-bold hover:bg-opacity-90 transition cursor-pointer flex items-center gap-2"
                >
                    <span className="text-xl">+</span> New Playground
                </button>
            </div>

            {loading ? (
                <div className="text-mocha-subtext0 text-center mt-10">Loading your sandboxes...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {safePlaygrounds.map(pg => (
                        <div 
                            key={pg.playground_id} 
                            onClick={() => navigate(`/playgrounds/${pg.playground_id}`)}
                            className="bg-mocha-mantle border border-mocha-surface0 hover:border-mocha-green transition-all duration-200 rounded-xl cursor-pointer flex flex-col h-64 shadow-sm relative group overflow-hidden"
                        >
                            {/* Visual Banner using Dicebear Bottts */}
                            <div className="h-34 w-full bg-mocha-crust relative overflow-hidden border-b border-mocha-surface0 shrink-0 flex justify-center items-center">
                                <img 
                                    src={`https://api.dicebear.com/10.x/stripes/svg?seed=${pg.playground_id}&baseColor=a6e3a1,94e2d5,cba6f7`} 
                                    alt="Playground Patten" 
                                    className="h-full w-full object-cover opacity-80"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button 
                                        onClick={(e) => openEditModal(e, pg)}
                                        className="p-1.5 text-mocha-subtext0 hover:text-mocha-blue bg-mocha-surface0/90 rounded backdrop-blur-sm transition"
                                        title="Edit Metadata"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, pg.playground_id)}
                                        className="p-1.5 text-mocha-subtext0 hover:text-mocha-red bg-mocha-surface0/90 rounded backdrop-blur-sm transition"
                                        title="Delete Playground"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            
                            {/* Card Body */}
                            <div className="p-4 flex-grow flex flex-col overflow-hidden">
                                <h2 className="text-lg font-bold text-mocha-text mb-1 truncate">
                                    {pg.name || 'Untitled Parser Playground'}
                                </h2>
                                <p className="text-mocha-subtext0 text-sm line-clamp-2 flex-grow">
                                    {pg.description || 'A playground sandbox for custom compiler generation.'}
                                </p>
                                
                                <div className="mt-2 pt-2 border-t border-mocha-surface0 flex justify-between items-center text-xs text-mocha-surface2 font-mono shrink-0">
                                    <span className="flex items-center gap-1">
                                        Type: <span className="text-mocha-green font-bold">{pg.parser_type || 'SLR1'}</span>
                                    </span>
                                    <span>{pg.createdAt ? new Date(pg.createdAt).toLocaleDateString() : 'New'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {safePlaygrounds.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-mocha-surface1 rounded-xl text-mocha-subtext0">
                            <span className="text-4xl mb-4">🧪</span>
                            <p>No playgrounds found. Spin up your first parser compiler.</p>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-mocha-crust/80 backdrop-blur-sm p-4">
                    <div className="bg-mocha-base border border-mocha-surface0 p-8 rounded-xl w-full max-w-md shadow-2xl transform transition-all">
                        <h2 className="text-2xl font-bold text-mocha-mauve mb-6">
                            {modalMode === 'CREATE' ? 'Create Playground' : 'Edit Playground'}
                        </h2>
                        
                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-mocha-subtext0 mb-1">Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-mocha-mantle border border-mocha-surface0 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-green transition-colors"
                                    placeholder="e.g., Simple Calculator Grammar"
                                    autoFocus
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-mocha-subtext0 mb-1">Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-mocha-mantle border border-mocha-surface0 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-green transition-colors min-h-[100px] resize-none"
                                    placeholder="What syntax are you evaluating here?"
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
                                    className="px-6 py-2 rounded-lg bg-mocha-green text-mocha-crust font-bold hover:bg-opacity-90 transition-colors cursor-pointer"
                                >
                                    {modalMode === 'CREATE' ? 'Create' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaygroundsList;