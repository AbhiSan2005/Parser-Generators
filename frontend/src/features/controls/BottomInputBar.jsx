import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { executeAlgorithm } from '../../api/algorithmClient';
import { setActiveWorkspace } from '../../store/workspaceSlice';

const BottomInputBar = () => {
    const [inputValue, setInputValue] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    
    const { activeWorkspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();

    if (!activeWorkspace) return null;
    const activeTab = activeWorkspace.tabs.find(t => t.tab_id === activeWorkspace.activeTabId);
    if (!activeTab) return null;

    const type = activeTab.automatonType;

    const runAlgorithm = async (actionType, targetType) => {
        if ((type === 'EMPTY' || type === 'REGEX') && !inputValue) {
            alert("Please enter a Regular Expression first!");
            return;
        }

        setIsExecuting(true);
        try {
            const payload = {
                actionType: actionType,
                targetAutomaton: targetType,
                // If we are starting from a Regex, send the string. Otherwise, send the machine data from the tab.
                inputData: (type === 'EMPTY' || type === 'REGEX') ? inputValue : activeTab.machine_data 
            };

            const response = await executeAlgorithm(activeWorkspace.workspace_id, activeTab.tab_id, payload);
            
            if (response.success) {
                dispatch(setActiveWorkspace(response.data));
            } else {
                alert(`Algorithm Error: ${response.Error}`);
            }
        } catch (error) {
            console.error(error);
            alert("Server connection failed.");
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#1e1e1e', padding: '15px 20px', borderTop: '1px solid #333', display: 'flex', gap: '15px', alignItems: 'center', overflowX: 'auto' }}>
            
            {(type === 'EMPTY' || type === 'REGEX') && (
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    placeholder="Enter Regex (e.g., (a+b)*a)..." 
                    style={{ minWidth: '250px', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#121212', color: 'white', fontFamily: 'monospace' }}
                    disabled={isExecuting}
                />
            )}

            <div style={{ display: 'flex', gap: '8px', color: '#aaa', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', marginRight: '10px', textTransform: 'uppercase' }}>Run:</span>
                
                {/* REGEX STARTING POINTS */}
                {(type === 'EMPTY' || type === 'REGEX') && (
                    <>
                        <button onClick={() => runAlgorithm('REGEX_TO_ENFA', 'ENFA')} disabled={isExecuting}>→ e-NFA</button>
                        <button onClick={() => runAlgorithm('REGEX_TO_DFA', 'DFA')} disabled={isExecuting}>→ DFA</button>
                        <button onClick={() => runAlgorithm('REGEX_TO_MINDFA_HOPCROFT', 'MIN_DFA')} disabled={isExecuting} style={{ color: '#4da6ff' }}>→ Min DFA</button>
                    </>
                )}

                {/* e-NFA STARTING POINTS */}
                {type === 'ENFA' && (
                    <>
                        <button onClick={() => runAlgorithm('ENFA_TO_NFA', 'NFA')} disabled={isExecuting}>→ NFA</button>
                        <button onClick={() => runAlgorithm('ENFA_TO_DFA', 'DFA')} disabled={isExecuting}>→ DFA</button>
                        <button onClick={() => runAlgorithm('ENFA_TO_MINDFA_HOPCROFT', 'MIN_DFA')} disabled={isExecuting} style={{ color: '#4da6ff' }}>→ Min DFA</button>
                        <button onClick={() => runAlgorithm('ENFA_TO_REGEX_GNFA', 'REGEX')} disabled={isExecuting} style={{ color: '#00cc66' }}>→ Regex (GNFA)</button>
                    </>
                )}

                {/* NFA STARTING POINTS */}
                {type === 'NFA' && (
                    <>
                        <button onClick={() => runAlgorithm('NFA_TO_DFA', 'DFA')} disabled={isExecuting}>→ DFA</button>
                        <button onClick={() => runAlgorithm('NFA_TO_MINDFA_HOPCROFT', 'MIN_DFA')} disabled={isExecuting} style={{ color: '#4da6ff' }}>→ Min DFA</button>
                        <button onClick={() => runAlgorithm('NFA_TO_REGEX_GNFA', 'REGEX')} disabled={isExecuting} style={{ color: '#00cc66' }}>→ Regex (GNFA)</button>
                    </>
                )}

                {/* DFA STARTING POINTS */}
                {type === 'DFA' && (
                    <>
                        <button onClick={() => runAlgorithm('DFA_TO_MINDFA_HOPCROFT', 'MIN_DFA')} disabled={isExecuting} style={{ color: '#4da6ff' }}>→ Minimize (Hopcroft)</button>
                        <button onClick={() => runAlgorithm('DFA_TO_REGEX_GNFA', 'REGEX')} disabled={isExecuting} style={{ color: '#00cc66' }}>→ Regex (GNFA)</button>
                    </>
                )}

                {/* MIN_DFA STARTING POINTS */}
                {type === 'MIN_DFA' && (
                    <>
                        <button onClick={() => runAlgorithm('DFA_TO_REGEX_GNFA', 'REGEX')} disabled={isExecuting} style={{ color: '#00cc66' }}>→ Regex (GNFA)</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default BottomInputBar;