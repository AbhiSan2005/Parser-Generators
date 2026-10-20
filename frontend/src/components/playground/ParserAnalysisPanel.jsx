// src/components/playground/ParserAnalysisPanel.jsx
import { useState } from 'react';

const ParserAnalysisPanel = ({ compiledData, type }) => {
    const [activeTab, setActiveTab] = useState('TABLE'); // 'TABLE' | 'SETS' | 'ITEM_SETS' | 'CONFLICTS'

    if (!compiledData || !compiledData.last_compiled_at) {
        return (
            <div className="flex-grow bg-mocha-mantle rounded-xl border border-mocha-surface0 p-6 flex flex-col items-center justify-center text-mocha-surface2 text-center h-full min-h-[400px]">
                <span className="text-4xl mb-3">📊</span>
                <p className="font-bold text-base text-mocha-subtext0">No Analysis Available</p>
                <p className="text-sm mt-1 max-w-xs">Compile your grammar above to render Parsing Tables, FIRST/FOLLOW sets, and Item Sets.</p>
            </div>
        );
    }

    const { analysis, states } = compiledData.item_sets || {};
    const parseTable = compiledData.parse_table || {};
    const conflicts = compiledData.conflicts || [];

    return (
        <div className="flex-grow bg-mocha-mantle rounded-xl border border-mocha-surface0 shadow-sm flex flex-col overflow-hidden h-full min-h-[400px]">
            
            {/* Tab Bar */}
            <div className="flex border-b border-mocha-surface0 bg-mocha-crust/50 px-4 pt-3 gap-2 shrink-0 overflow-x-auto custom-scrollbar">
                <button
                    onClick={() => setActiveTab('TABLE')}
                    className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-colors border-t border-x ${
                        activeTab === 'TABLE'
                        ? 'bg-mocha-mantle text-mocha-mauve border-mocha-surface0 border-b-mocha-mantle'
                        : 'text-mocha-subtext0 border-transparent hover:text-mocha-text'
                    }`}
                >
                    📋 Parse Table
                </button>

                <button
                    onClick={() => setActiveTab('SETS')}
                    className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-colors border-t border-x ${
                        activeTab === 'SETS'
                        ? 'bg-mocha-mantle text-mocha-mauve border-mocha-surface0 border-b-mocha-mantle'
                        : 'text-mocha-subtext0 border-transparent hover:text-mocha-text'
                    }`}
                >
                    🧮 First & Follow Sets
                </button>

                {type !== 'LL1' && (
                    <button
                        onClick={() => setActiveTab('ITEM_SETS')}
                        className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-colors border-t border-x ${
                            activeTab === 'ITEM_SETS'
                            ? 'bg-mocha-mantle text-mocha-mauve border-mocha-surface0 border-b-mocha-mantle'
                            : 'text-mocha-subtext0 border-transparent hover:text-mocha-text'
                        }`}
                    >
                        ⚙️ LR Item Sets ({states ? Object.keys(states).length : 0})
                    </button>
                )}

                {conflicts.length > 0 && (
                    <button
                        onClick={() => setActiveTab('CONFLICTS')}
                        className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-colors border-t border-x flex items-center gap-1.5 ${
                            activeTab === 'CONFLICTS'
                            ? 'bg-mocha-mantle text-mocha-red border-mocha-surface0 border-b-mocha-mantle'
                            : 'text-mocha-red border-transparent hover:text-mocha-red/80'
                        }`}
                    >
                        <span>⚠️</span> Conflicts ({conflicts.length})
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="p-4 flex-grow overflow-y-auto custom-scrollbar font-mono text-sm">
                
                {/* 1. PARSE TABLE TAB */}
                {activeTab === 'TABLE' && (
                    <div className="flex flex-col gap-4">
                        {type === 'LL1' ? (
                            /* LL(1) Parsing Table */
                            <div className="overflow-x-auto rounded-lg border border-mocha-surface1 shadow-inner">
                                <table className="min-w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="sticky top-0 z-10 bg-mocha-crust text-mocha-mauve">
                                            <th className="p-3 border-b border-r border-mocha-surface1">Non-Terminal</th>
                                            <th className="p-3 border-b border-mocha-surface1">Lookahead Entries</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(parseTable).map(([variable, entryMap], rowIndex) => (
                                            <tr key={variable} className={`border-b border-mocha-surface0 hover:bg-mocha-surface0/40 ${rowIndex % 2 === 0 ? 'bg-mocha-base/30' : 'bg-mocha-mantle/40'}`}>
                                                <td className="sticky left-0 border-r border-mocha-surface1 px-3 py-2 font-bold text-mocha-yellow">{variable}</td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(entryMap || {}).map(([terminal, prod]) => (
                                                            <span key={terminal} className="px-2.5 py-1.5 bg-mocha-crust border border-mocha-surface1 rounded-md text-xs shadow-sm">
                                                                <span className="text-mocha-green font-bold">{terminal}</span> → {variable} → {Array.isArray(prod) ? prod.join(' ') : prod}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Bottom-Up Action/GOTO Table */
                            <div className="overflow-x-auto rounded-lg border border-mocha-surface1 shadow-inner">
                                <table className="min-w-[680px] w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="sticky top-0 z-10 bg-mocha-crust text-mocha-mauve">
                                            <th className="p-3 border-b border-r border-mocha-surface1">State</th>
                                            <th className="p-3 border-b border-r border-mocha-surface1">Action Table</th>
                                            <th className="p-3 border-b border-mocha-surface1">GOTO Table</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(parseTable.action || {}).map((stateId, rowIndex) => (
                                            <tr key={stateId} className={`border-b border-mocha-surface0 hover:bg-mocha-surface0/40 ${rowIndex % 2 === 0 ? 'bg-mocha-base/30' : 'bg-mocha-mantle/40'}`}>
                                                <td className="sticky left-0 border-r border-mocha-surface1 px-3 py-2 font-bold text-mocha-blue">I{stateId}</td>
                                                <td className="p-3 border-r border-mocha-surface1">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {Object.entries(parseTable.action[stateId] || {}).map(([term, act]) => (
                                                            <span key={term} className="px-1.5 py-0.5 bg-mocha-crust border border-mocha-surface0 rounded text-xs">
                                                                <span className="text-mocha-green">{term}</span>: <span className="text-mocha-peach font-bold">{act}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {Object.entries(parseTable.goto[stateId] || {}).map(([varName, targetState]) => (
                                                            <span key={varName} className="px-1.5 py-0.5 bg-mocha-crust border border-mocha-surface0 rounded text-xs">
                                                                <span className="text-mocha-yellow">{varName}</span> → I{targetState}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. FIRST & FOLLOW SETS TAB */}
                {activeTab === 'SETS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nullable Variables */}
                        <div className="col-span-full bg-mocha-crust p-3 rounded-lg border border-mocha-surface0">
                            <span className="text-xs font-bold uppercase text-mocha-subtext0 block mb-1">Nullable Variables</span>
                            <div className="flex gap-2">
                                {(analysis?.nullable_variables || []).length > 0 ? (
                                    analysis.nullable_variables.map(v => (
                                        <span key={v} className="px-2 py-0.5 bg-mocha-surface0 text-mocha-teal rounded text-xs font-bold">{v}</span>
                                    ))
                                ) : (
                                    <span className="text-xs text-mocha-surface2">None</span>
                                )}
                            </div>
                        </div>

                        {/* First Sets */}
                        <div className="bg-mocha-crust p-3 rounded-lg border border-mocha-surface0">
                            <span className="text-xs font-bold uppercase text-mocha-green block mb-2">FIRST Sets</span>
                            <div className="flex flex-col gap-1.5">
                                {Object.entries(analysis?.first_sets || {}).map(([v, set]) => (
                                    <div key={v} className="text-xs flex justify-between border-b border-mocha-surface0/50 pb-1">
                                        <span className="font-bold text-mocha-yellow">FIRST({v})</span>
                                        <span className="text-mocha-text">{`{ ${Array.from(set).join(', ')} }`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Follow Sets */}
                        <div className="bg-mocha-crust p-3 rounded-lg border border-mocha-surface0">
                            <span className="text-xs font-bold uppercase text-mocha-blue block mb-2">FOLLOW Sets</span>
                            <div className="flex flex-col gap-1.5">
                                {Object.entries(analysis?.follow_sets || {}).map(([v, set]) => (
                                    <div key={v} className="text-xs flex justify-between border-b border-mocha-surface0/50 pb-1">
                                        <span className="font-bold text-mocha-yellow">FOLLOW({v})</span>
                                        <span className="text-mocha-text">{`{ ${Array.from(set).join(', ')} }`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. ITEM SETS TAB (LR0 / SLR1) */}
                {activeTab === 'ITEM_SETS' && states && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(states).map(([id, items]) => (
                            <div key={id} className="bg-mocha-crust p-3 rounded-lg border border-mocha-surface0">
                                <div className="text-xs font-bold text-mocha-mauve mb-1 border-b border-mocha-surface0 pb-1">
                                    State I{id}
                                </div>
                                <div className="flex flex-col gap-0.5 text-xs text-mocha-text">
                                    {Array.isArray(items) && items.map((item, idx) => (
                                        <div key={idx} className="truncate">{typeof item === 'string' ? item : JSON.stringify(item)}</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. CONFLICTS TAB */}
                {activeTab === 'CONFLICTS' && (
                    <div className="flex flex-col gap-2">
                        {conflicts.map((err, idx) => (
                            <div key={idx} className="p-3 bg-mocha-red/10 border border-mocha-red/30 rounded-lg text-mocha-red text-xs">
                                ⚠️ {err}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ParserAnalysisPanel;