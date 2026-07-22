import React, { useEffect, useRef } from 'react';

export const ALGORITHM_CONFIG = {
    'REGEX_TO_ENFA': { label: 'Regex to ε-NFA', type: 'REGEX', target: 'ENFA' },
    'REGEX_TO_NFA': { label: 'Regex to NFA', type: 'REGEX', target: 'NFA' },
    'REGEX_TO_DFA': { label: 'Regex to DFA', type: 'REGEX', target: 'DFA' },
    'REGEX_TO_MINDFA_HOPCROFT': { label: 'Regex to Minimized DFA', type: 'REGEX', target: 'MIN_DFA' },
    
    'ENFA_TO_NFA': { label: 'ε-NFA to NFA', type: 'MACHINE', target: 'NFA' },
    'NFA_TO_DFA': { label: 'NFA to DFA', type: 'MACHINE', target: 'DFA' },
    'ENFA_TO_DFA': { label: 'ε-NFA to DFA', type: 'MACHINE', target: 'DFA' },
    'DFA_TO_MINDFA_HOPCROFT': { label: 'Minimize DFA (Hopcroft)', type: 'MACHINE', target: 'MIN_DFA' },
    
    'SIMPLIFY_CFG': { label: 'Simplify CFG', type: 'CFG', target: 'CFG' },
    'CFG_TO_CNF': { label: 'CFG to CNF', type: 'CFG', target: 'CNF' },
    'CYK_ALGORITHM': { label: 'CYK Algorithm', type: 'CFG_CYK', target: 'CYK' },
};

const InputMenu = ({ 
    activeTabId,
    selectedAlgo, 
    setSelectedAlgo, 
    algoInput, 
    setAlgoInput, 
    testString,
    setTestString,
    handleExecuteAlgo, 
    isExecuting
}) => {
    // Persistent memory map across tabs
    const tabStateMapRef = useRef({});
    const prevTabIdRef = useRef(activeTabId);

    // Synchronize & restore state whenever activeTabId changes
    useEffect(() => {
        if (!activeTabId) return;

        const prevTabId = prevTabIdRef.current;

        // Save previous tab inputs
        if (prevTabId && prevTabId !== activeTabId) {
            tabStateMapRef.current[prevTabId] = {
                selectedAlgo,
                algoInput,
                testString
            };
        }

        // Restore active tab inputs if previously cached
        const savedTabState = tabStateMapRef.current[activeTabId];
        if (savedTabState) {
            if (savedTabState.selectedAlgo !== undefined) setSelectedAlgo(savedTabState.selectedAlgo);
            if (savedTabState.algoInput !== undefined) setAlgoInput(savedTabState.algoInput);
            if (savedTabState.testString !== undefined) setTestString(savedTabState.testString);
        }

        prevTabIdRef.current = activeTabId;
    }, [activeTabId]);

    // Update active tab cache on direct edits
    const handleAlgoChange = (val) => {
        setSelectedAlgo(val);
        if (activeTabId) {
            tabStateMapRef.current[activeTabId] = {
                ...(tabStateMapRef.current[activeTabId] || {}),
                selectedAlgo: val
            };
        }
    };

    const handleInputChange = (val) => {
        setAlgoInput(val);
        if (activeTabId) {
            tabStateMapRef.current[activeTabId] = {
                ...(tabStateMapRef.current[activeTabId] || {}),
                algoInput: val
            };
        }
    };

    const handleTestStringChange = (val) => {
        setTestString(val);
        if (activeTabId) {
            tabStateMapRef.current[activeTabId] = {
                ...(tabStateMapRef.current[activeTabId] || {}),
                testString: val
            };
        }
    };

    const currentAlgoConfig = selectedAlgo ? ALGORITHM_CONFIG[selectedAlgo] : null;
    const isCyk = currentAlgoConfig?.type === 'CFG_CYK';

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isCyk && !isExecuting) {
            handleExecuteAlgo();
        }
    };

    return (
        <div className="m-4 mt-0 bg-mocha-mantle border border-mocha-surface0 rounded-xl p-6 shadow-md shrink-0 flex flex-col gap-6">
            
            {/* Header */}
            <div className="border-b border-mocha-surface0 pb-2">
                <h3 className="text-xl font-bold text-mocha-text flex items-center gap-2">
                    <span className="text-mocha-mauve">⚙️</span> Execution Engine
                </h3>
                <p className="text-sm text-mocha-subtext0 mt-1">Transform, minimize, and analyze your automata and formal grammars.</p>
            </div>

            {/* Algorithm Selector Row */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex flex-col gap-2 flex-grow w-full">
                    <label className="text-sm font-bold text-mocha-mauve uppercase tracking-wider">Select Algorithm</label>
                    <select 
                        value={selectedAlgo}
                        onChange={(e) => handleAlgoChange(e.target.value)}
                        className="bg-mocha-crust border border-mocha-surface1 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-mauve cursor-pointer shadow-inner w-full text-base"
                    >
                        <option value="">-- Choose Execution --</option>
                        {Object.entries(ALGORITHM_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={handleExecuteAlgo}
                    disabled={!selectedAlgo || isExecuting}
                    className={`px-8 py-3 rounded-lg font-bold transition-all text-base h-[50px] shrink-0 ${
                        !selectedAlgo || isExecuting 
                        ? 'bg-mocha-surface0 text-mocha-surface2 cursor-not-allowed' 
                        : 'bg-mocha-green text-mocha-crust hover:bg-opacity-90 shadow-[0_0_20px_rgba(166,227,161,0.2)] hover:shadow-[0_0_25px_rgba(166,227,161,0.4)]'
                    }`}
                >
                    {isExecuting ? 'Processing...' : 'Run Algorithm'}
                </button>
            </div>

            {/* Side-by-Side Grid: Input Grammar & String Validation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-mocha-surface0">
                
                {/* Left Column: CFG / Regex Input */}
                <div className="flex flex-col gap-2 w-full">
                    {currentAlgoConfig?.type === 'REGEX' && (
                        <>
                            <label className="text-sm font-bold text-mocha-blue uppercase tracking-wider">Regular Expression</label>
                            <input 
                                type="text" 
                                value={algoInput}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="e.g., (a+b)*.a"
                                className="w-full bg-mocha-crust border border-mocha-surface1 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-blue font-mono shadow-inner text-lg tracking-widest"
                            />
                        </>
                    )}
                    {currentAlgoConfig?.type?.startsWith('CFG') && (
                        <>
                            <label className="text-sm font-bold text-mocha-green uppercase tracking-wider">Context-Free Grammar</label>
                            <textarea 
                                value={algoInput}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="S -> A B | B C&#10;A -> B A | a"
                                className="w-full bg-mocha-crust border border-mocha-surface1 text-mocha-text rounded-lg p-3 outline-none focus:border-mocha-green font-mono min-h-[90px] shadow-inner custom-scrollbar"
                            />
                        </>
                    )}
                    {currentAlgoConfig?.type === 'MACHINE' && (
                        <>
                            <label className="text-sm font-bold text-mocha-subtext0 uppercase tracking-wider">Automaton Source</label>
                            <div className="h-[52px] flex items-center px-4 bg-mocha-crust border border-mocha-surface1 rounded-lg text-mocha-subtext0 shadow-inner">
                                <span className="mr-2">⚡</span> Input data will be extracted from active tab.
                            </div>
                        </>
                    )}
                    {!currentAlgoConfig && (
                        <>
                            <label className="text-sm font-bold text-mocha-subtext0 uppercase tracking-wider">Algorithm Input</label>
                            <div className="h-[52px] flex items-center px-4 bg-mocha-crust border border-dashed border-mocha-surface1 rounded-lg text-mocha-surface2 shadow-inner">
                                Select an algorithm above to view input requirements.
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column: String Validation Input */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-sm font-bold text-mocha-subtext0 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><span className="text-mocha-blue">🧪</span> String Validation</span>
                        <span className={`text-xs font-normal lowercase ${isCyk ? 'text-mocha-green' : 'text-mocha-surface2'}`}>
                            {isCyk ? '(required for CYK)' : '(disabled)'}
                        </span>
                    </label>
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            disabled={!isCyk}
                            value={testString}
                            onChange={(e) => handleTestStringChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter string to evaluate (e.g. baaba)..."
                            className={`flex-grow bg-mocha-crust border border-mocha-surface1 rounded-lg p-3 outline-none font-mono shadow-inner text-lg tracking-widest ${isCyk ? 'text-mocha-text focus:border-mocha-blue cursor-text' : 'text-mocha-surface2 cursor-not-allowed opacity-50'}`}
                        />
                        <button 
                            type="button"
                            onClick={handleExecuteAlgo}
                            disabled={!isCyk || isExecuting}
                            className={`px-6 py-3 rounded-lg font-bold text-sm border shrink-0 transition-colors ${
                                isCyk && !isExecuting 
                                ? 'bg-mocha-mauve text-mocha-crust border-mocha-mauve hover:bg-opacity-90 cursor-pointer shadow-sm' 
                                : 'bg-mocha-surface0 text-mocha-surface2 border-mocha-surface1 cursor-not-allowed opacity-50'
                            }`}
                        >
                            {isExecuting ? 'Testing...' : 'Test String'}
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default InputMenu;