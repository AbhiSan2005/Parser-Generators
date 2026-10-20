import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveWorkspace, setActiveTab } from '../store/workspaceSlice';
import { getWorkspaceById, createTab, updateTab } from '../api/workspaceClient';
import { executeAlgorithm } from '../api/engineClient';
import AutomataCanvas from '../components/canvas/AutomataCanvas';
import InputMenu from '../components/InputMenu';
import { ALGORITHM_CONFIG } from '../utils/algorithmConfig';
import MachineDescription from '../components/MachineDescription';

// Make sure the path matches where you stored the parsing utility
import { parseCfgString } from '../utils/cfgParser.js';

const TabView = () => {
    const { workspace_id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { activeWorkspace } = useSelector((state) => state.workspace);
    const tabs = activeWorkspace?.tabs || [];
    const activeTabId = activeWorkspace?.activeTabId;
    const activeTab = tabs.find(t => t.tab_id === activeTabId);

    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('CANVAS'); // 'CANVAS' or 'DESCRIPTION'
    const [isEditMode, setIsEditMode] = useState(false);

    const [openTabIds, setOpenTabIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tabFormData, setTabFormData] = useState({ tabName: '', language_type: 'REGULAR' });

    const [selectedAlgo, setSelectedAlgo] = useState('');
    const [algoInput, setAlgoInput] = useState('');
    const [testString, setTestString] = useState(''); // Hoisted state
    const [isExecuting, setIsExecuting] = useState(false);
    const [locateTrigger, setLocateTrigger] = useState(0);

    useEffect(() => {
        loadWorkspace();
    }, [workspace_id]);

    useEffect(() => {
        if (activeTabId) {
            const currentActiveTab = tabs.find(t => t.tab_id === activeTabId);
            setOpenTabIds(prev => {
                if (!prev.includes(activeTabId)) {
                    return [...prev, activeTabId];
                }
                return prev;
            });

            // Switch Default View Based on Architecture Language
            if (currentActiveTab && (currentActiveTab.language_type === 'CONTEXT_FREE' || ['CFG', 'CNF', 'CYK'].includes(currentActiveTab.automatonType))) {
                setViewMode('DESCRIPTION');
            } else {
                setViewMode('CANVAS');
            }
        }
        setIsEditMode(false);
    }, [activeTabId]);

    const loadWorkspace = async () => {
        try {
            setLoading(true);
            const response = await getWorkspaceById(workspace_id);
            const wsData = response?.data || response;
            dispatch(setActiveWorkspace(wsData));
            if (wsData.tabs && wsData.tabs.length > 0) {
                const initialTabId = wsData.activeTabId || wsData.tabs[0].tab_id;
                if (!wsData.activeTabId) {
                    dispatch(setActiveTab(initialTabId));
                }
                setOpenTabIds([initialTabId]);
            }
        } catch (error) {
            console.error("Failed to load workspace:", error);
            navigate('/workspaces');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTab = async (e) => {
        e.preventDefault();
        try {
            const response = await createTab(workspace_id, {
                tabName: tabFormData.tabName || 'New Tab',
                language_type: tabFormData.language_type
            });
            const wsData = response?.data || response;
            dispatch(setActiveWorkspace(wsData));
            if (wsData?.activeTabId) {
                setOpenTabIds(prev => prev.includes(wsData.activeTabId) ? prev : [...prev, wsData.activeTabId]);
            }
            setIsModalOpen(false);
            setTabFormData({ tabName: '', language_type: 'REGULAR' });
        } catch (error) {
            console.error("Failed to create tab:", error);
        }
    };

    const handleCloseTab = (e, tabIdToClose) => {
        e.stopPropagation();
        const newOpenTabs = openTabIds.filter(id => id !== tabIdToClose);
        setOpenTabIds(newOpenTabs);

        if (activeTabId === tabIdToClose) {
            dispatch(setActiveTab(newOpenTabs.length > 0 ? newOpenTabs[0] : null));
        }
    };

    const handleLocateGraph = () => {
        setLocateTrigger(prev => prev + 1);
    };

    const handlePresetSelect = async (preset) => {
        const tabSource = preset.kind === 'MACHINE'
            ? { automatonType: preset.machineType, machine_data: preset.machineData }
            : { automatonType: preset.kind === 'REGEX' ? 'REGEX' : 'EMPTY', machine_data: {} };
        const response = await updateTab(workspace_id, activeTabId, {
            ...tabSource
        });
        if (response?.success === false) throw new Error(response.Error || 'Preset could not be loaded.');
        dispatch(setActiveWorkspace(response?.data || response));
        setViewMode('CANVAS');
    };

    const handleExecuteAlgo = async () => {
        if (!selectedAlgo) return;
        const algoConfig = ALGORITHM_CONFIG[selectedAlgo];

        try {
            setIsExecuting(true);
            let formattedInput = algoInput;

            // Format Plain-Text to Object Mapping 
            if (algoConfig.type?.startsWith('CFG')) {
                if (!algoInput || algoInput.trim() === '') {
                    alert("Please enter a Context-Free Grammar before running.");
                    setIsExecuting(false);
                    return;
                }

                try {
                    formattedInput = parseCfgString(algoInput);
                } catch (e) {
                    alert(`CFG Parsing Error: ${e.message}`);
                    setIsExecuting(false);
                    return;
                }
            }

            const payload = {
                actionType: selectedAlgo,
                targetAutomaton: algoConfig.target,
                inputData: algoConfig.type === 'MACHINE'
                    ? null
                    : (algoConfig.type === 'CFG_CYK' ? { grammar: formattedInput, word: testString || "" } : formattedInput)
            };

            const response = await executeAlgorithm(workspace_id, activeTabId, payload);
            if (response.success) {
                dispatch(setActiveWorkspace(response.data));
                // Automatically switch to Description View so the user immediately sees the matrix/steps
                setViewMode('DESCRIPTION');
            } else {
                alert(`Error: ${response.Error || 'Algorithm execution failed'}`);
            }
        } catch (error) {
            console.error("Algorithm execution failed:", error);
            alert(`Execution Error: ${error.message || 'An error occurred while calling backend.'}`);
        } finally {
            setIsExecuting(false);
        }
    };

    if (loading) return <div className="p-10 text-mocha-subtext0">Loading Workspace...</div>;

    if (tabs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full flex-grow p-10 bg-mocha-base">
                <div className="text-6xl mb-6">🗂️</div>
                <h2 className="text-2xl font-bold text-mocha-text mb-2">Workspace is Empty</h2>
                <p className="text-mocha-subtext0 mb-8 max-w-md text-center">
                    You haven't created any automata or grammar tabs yet. Create a tab to access the canvas and execution engine.
                </p>
                <button onClick={() => setIsModalOpen(true)} className="bg-mocha-mauve text-mocha-crust px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition text-lg">
                    + Create First Tab
                </button>
                {renderCreateModal()}
            </div>
        );
    }

    const openTabs = tabs.filter(t => openTabIds.includes(t.tab_id));

    return (
        <div className="flex flex-col min-h-screen w-full bg-mocha-base overflow-y-auto custom-scrollbar">

            {/* Top Workspace Tab Bar */}
            <div className="flex bg-mocha-crust border-b border-mocha-surface0 overflow-x-auto shrink-0 custom-scrollbar sticky top-0 z-40">
                {openTabs.map(tab => (
                    <div
                        key={tab.tab_id}
                        onClick={() => dispatch(setActiveTab(tab.tab_id))}
                        className={`group flex items-center justify-between gap-4 px-5 py-3 border-r border-mocha-surface0 cursor-pointer min-w-[150px] max-w-[250px] transition-colors ${activeTabId === tab.tab_id ? 'bg-mocha-base border-t-2 border-t-mocha-mauve' : 'hover:bg-mocha-mantle text-mocha-subtext0'
                            }`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-mocha-mauve font-bold shrink-0">
                                {tab.language_type === 'REGULAR' ? '®' : tab.language_type === 'CONTEXT_FREE' ? '©' : 'λ'}
                            </span>
                            <span className="truncate text-sm font-medium">{tab.tabName}</span>
                        </div>
                        <button
                            onClick={(e) => handleCloseTab(e, tab.tab_id)}
                            className="text-mocha-subtext0 hover:text-mocha-red transition-colors shrink-0"
                            title="Close Tab"
                        >
                            ✖
                        </button>
                    </div>
                ))}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-3 text-mocha-subtext0 hover:text-mocha-text hover:bg-mocha-mantle transition-colors font-bold shrink-0 flex items-center justify-center border-r border-mocha-surface0"
                    title="New Tab"
                >
                    +
                </button>
            </div>

            {openTabs.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-mocha-subtext0 p-10 mt-20">
                    <span className="text-5xl mb-4">📭</span>
                    <h3 className="text-xl font-bold text-mocha-text mb-2">No Tabs Open</h3>
                    <p>Select a tab from the sidebar or click the '+' button to create a new one.</p>
                </div>
            ) : (
                <>
                    {activeTabId && (
                        <div className="flex justify-between items-center p-4 pb-0 shrink-0 flex-wrap gap-3">

                            {/* Left Side: View Mode Selector */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* 1. Graph Canvas View Button */}
                                <button
                                    onClick={() => setViewMode('CANVAS')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'CANVAS'
                                        ? 'bg-mocha-surface0 text-mocha-mauve border border-mocha-surface1'
                                        : 'bg-mocha-mantle text-mocha-subtext0 border border-mocha-surface0 hover:text-mocha-text'
                                        }`}
                                >
                                    Graph Canvas
                                </button>

                                {/* 2. Active Machine Description Button */}
                                <button
                                    onClick={() => setViewMode('DESCRIPTION')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${viewMode === 'DESCRIPTION'
                                        ? 'bg-mocha-surface0 text-mocha-mauve border border-mocha-surface1'
                                        : 'bg-mocha-mantle text-mocha-subtext0 border border-mocha-surface0 hover:text-mocha-text'
                                        }`}
                                >
                                    📄 Machine / CFG Description
                                </button>
                            </div>

                            {/* Right Side: Graph Action Controls & Edit Toggle */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    disabled
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-mocha-surface0 text-mocha-surface2 border border-mocha-surface1 cursor-not-allowed opacity-50 flex items-center gap-1.5"
                                    title="Auto-Format is currently disabled"
                                >
                                    ✨ Auto-Format Graph
                                </button>

                                <button
                                    onClick={handleLocateGraph}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-mocha-surface0 text-mocha-text hover:bg-mocha-surface1 border border-mocha-surface1 transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    🎯 Locate Graph
                                </button>

                                {viewMode === 'CANVAS' && (
                                    <button
                                        disabled
                                        className={`px-4 py-2 rounded-lg text-sm font-bold bg-mocha-surface0 text-mocha-surface2 border border-mocha-surface1 cursor-not-allowed opacity-50 flex items-center gap-1.5`}
                                    >
                                        {isEditMode ? '🔓 Edit Mode Active' : '🔒 View Mode'}
                                    </button>
                                )}
                            </div>

                        </div>
                    )}

                    {/* Canvas Area / Machine Description View */}
                    <div className="flex-grow p-4 shrink-0">
                        {viewMode === 'CANVAS' ? (
                            <div className="h-[60vh] min-h-[500px] w-full">
                                <AutomataCanvas
                                    machineData={activeTab?.machine_data}
                                    canvasMetadata={activeTab?.canvas_metadata}
                                    isEditMode={isEditMode}
                                    locateGraphTrigger={locateTrigger}
                                    onLayoutSave={(data) => console.log("Layout Saved:", data)}
                                />
                            </div>
                        ) : (
                            <div className="bg-mocha-mantle border border-mocha-surface0 rounded-xl p-8 min-h-[500px] shadow-sm overflow-y-auto">
                                <MachineDescription
                                    machineData={activeTab?.machine_data}
                                    automatonType={activeTab?.automatonType}
                                />
                            </div>
                        )}
                    </div>

                    {/* Bottom Execution Menu */}
                    <InputMenu
                        selectedAlgo={selectedAlgo}
                        setSelectedAlgo={setSelectedAlgo}
                        algoInput={algoInput}
                        setAlgoInput={setAlgoInput}
                        testString={testString}
                        setTestString={setTestString}
                        handleExecuteAlgo={handleExecuteAlgo}
                        isExecuting={isExecuting}
                        onPresetSelect={handlePresetSelect}
                    />
                </>
            )}

            {renderCreateModal()}
        </div>
    );

    function renderCreateModal() {
        if (!isModalOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-mocha-crust/80 backdrop-blur-sm p-4">
                <div className="bg-mocha-base border border-mocha-surface0 p-8 rounded-xl w-full max-w-md shadow-2xl">
                    <h2 className="text-2xl font-bold text-mocha-mauve mb-6">Create New Tab</h2>
                    <form onSubmit={handleCreateTab} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-bold text-mocha-subtext0 mb-1">Tab Name</label>
                            <input
                                type="text"
                                value={tabFormData.tabName}
                                onChange={(e) => setTabFormData({ ...tabFormData, tabName: e.target.value })}
                                className="w-full bg-mocha-mantle border border-mocha-surface0 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-mauve"
                                placeholder="e.g., Lexical Analyzer NFA"
                                autoFocus
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-mocha-subtext0 mb-1">Language Family</label>
                            <select
                                value={tabFormData.language_type}
                                onChange={(e) => setTabFormData({ ...tabFormData, language_type: e.target.value })}
                                className="w-full bg-mocha-mantle border border-mocha-surface0 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-mauve cursor-pointer"
                            >
                                <option value="REGULAR">Regular Language (Regex, NFA, DFA)</option>
                                <option value="CONTEXT_FREE">Context-Free Language (CFG, PDA)</option>
                                <option value="TURING">Recursively Enumerable (Turing Machine)</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-mocha-subtext0 hover:bg-mocha-surface0 font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-mocha-mauve text-mocha-crust font-bold hover:bg-opacity-90"
                            >
                                Create Tab
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
};

export default TabView;