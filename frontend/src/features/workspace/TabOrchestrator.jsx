import { useState } from 'react';
import { useSelector } from 'react-redux';
import ViewToggle from './ViewToggle';
import DerivationLayout from '../derivation/DerivationLayout'; // <-- NEW IMPORT

const TabOrchestrator = () => {
    const { activeWorkspace } = useSelector((state) => state.workspace);
    const [activeView, setActiveView] = useState('canvas');

    if (!activeWorkspace || !activeWorkspace.tabs || activeWorkspace.tabs.length === 0) {
        return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#666' }}>No open tabs. Create a new tab.</div>;
    }

    const activeTab = activeWorkspace.tabs.find(t => t.tab_id === activeWorkspace.activeTabId) || activeWorkspace.tabs[0];
    const isRegexTab = activeTab.automatonType === 'REGEX';
    const currentView = isRegexTab ? 'derivation' : activeView;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {!isRegexTab && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', backgroundColor: '#1a1a1a', borderBottom: '1px solid #333' }}>
                    <ViewToggle activeView={currentView} setActiveView={setActiveView} />
                </div>
            )}

            <div style={{ flexGrow: 1, overflow: 'auto', position: 'relative', backgroundColor: '#121212' }}>
                {currentView === 'canvas' ? (
                    <div style={{ color: 'white', padding: '20px' }}>
                        <h3 style={{ color: '#4da6ff' }}>[ Canvas Component Placeholder ]</h3>
                        <p style={{ color: '#aaa' }}>We will build the React Flow canvas next!</p>
                    </div>
                ) : (
                    <DerivationLayout activeTab={activeTab} /> // <-- USE COMPONENT HERE
                )}
            </div>
        </div>
    );
};

export default TabOrchestrator;