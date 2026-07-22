import React from 'react';

/**
 * Robustly parses CYK matrix from multiple possible structures:
 * - 2D Array: [[...], [...]]
 * - Object with keys like 'row_1', 'row_2', ... or '1', '2', ...
 */
const extractCykMatrix = (data) => {
    if (!data) return null;
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') {
        const keys = Object.keys(data);
        const rowKeys = keys.filter(k => k.toLowerCase().startsWith('row_') || !isNaN(Number(k)));
        if (rowKeys.length > 0) {
            rowKeys.sort((a, b) => {
                const numA = parseInt(a.replace(/\D/g, ''), 10);
                const numB = parseInt(b.replace(/\D/g, ''), 10);
                return numA - numB;
            });
            return rowKeys.map(k => data[k]);
        }
    }
    return null;
};

/**
 * Normalizes machine data across all workspace tab formats (ENFA, NFA, DFA, MIN_DFA).
 */
const extractNormalizedMachineData = (data) => {
    if (!data) return null;

    const states = data.states || data.Q || [];
    const startState = data.start_state ?? data.startState ?? data.initialState ?? data.initial_state ?? data.start ?? null;
    const rawAccept = data.accept_states ?? data.acceptStates ?? data.finalStates ?? data.final_states ?? data.accept ?? [];
    const acceptStates = Array.isArray(rawAccept) ? rawAccept : [rawAccept];
    const stateMappings = data.state_mapping ?? data.state_mappings ?? data.stateMappings ?? data.mappings ?? data.mapping ?? data.partition_mappings ?? data.partitions ?? null;
    const epsilonClosures = data.epsilon_closures ?? data.epsilonClosures ?? null;
    const rawTransitions = data.transition_table || data.transitions || data.delta || {};
    const rawAlphabet = data.alphabet || data.Sigma || [];

    const normalizedTransitions = {};
    const detectedSymbols = new Set(rawAlphabet.map(s => String(s)));
    const isEpsilonSymbol = (s) => s === '' || s === 'ε' || s === 'epsilon' || s === 'eps' || s === '$';

    states.forEach(st => { normalizedTransitions[st] = {}; });

    if (Array.isArray(rawTransitions)) {
        rawTransitions.forEach(t => {
            const src = t.from || t.source || t.from_state || t.fromState;
            const tgt = t.to || t.target || t.to_state || t.toState;
            const sym = t.symbol ?? t.label ?? t.via ?? "";

            if (src && tgt) {
                detectedSymbols.add(String(sym));
                if (!normalizedTransitions[src]) normalizedTransitions[src] = {};
                if (!normalizedTransitions[src][sym]) normalizedTransitions[src][sym] = [];
                if (!normalizedTransitions[src][sym].includes(String(tgt))) {
                    normalizedTransitions[src][sym].push(String(tgt));
                }
            }
        });
    } else if (typeof rawTransitions === 'object' && rawTransitions !== null) {
        Object.entries(rawTransitions).forEach(([srcState, symMap]) => {
            if (!normalizedTransitions[srcState]) normalizedTransitions[srcState] = {};

            if (Array.isArray(symMap)) {
                symMap.forEach(item => {
                    const tgt = item.to || item.target || item.state;
                    const sym = item.symbol ?? item.label ?? "";
                    if (tgt) {
                        detectedSymbols.add(String(sym));
                        if (!normalizedTransitions[srcState][sym]) normalizedTransitions[srcState][sym] = [];
                        if (!normalizedTransitions[srcState][sym].includes(String(tgt))) {
                            normalizedTransitions[srcState][sym].push(String(tgt));
                        }
                    }
                });
            } else if (typeof symMap === 'object' && symMap !== null) {
                Object.entries(symMap).forEach(([sym, targets]) => {
                    detectedSymbols.add(String(sym));
                    const targetArray = Array.isArray(targets) ? targets : [targets];
                    normalizedTransitions[srcState][sym] = targetArray.map(String);
                });
            }
        });
    }

    const allSymbols = Array.from(detectedSymbols);
    const alphabet = allSymbols.filter(s => !isEpsilonSymbol(s));
    const hasEpsilon = allSymbols.some(isEpsilonSymbol);

    return {
        states,
        startState,
        acceptStates,
        stateMappings,
        epsilonClosures,
        transitions: normalizedTransitions,
        alphabet,
        hasEpsilon
    };
};

/**
 * Renders intermediate grammar partitions/rules cleanly for non-CYK derivation steps.
 */
const renderPartitions = (partitions) => {
    if (!partitions || typeof partitions !== 'object') return null;
    
    return (
        <div className="bg-mocha-base/60 border border-mocha-surface0 p-3 rounded-lg mt-2 font-mono text-xs text-mocha-text flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-mocha-mauve uppercase tracking-wider block border-b border-mocha-surface0 pb-1 mb-1">
                Grammar State at Step:
            </span>
            {Object.entries(partitions).map(([lhs, rhsList]) => {
                let formattedRhs = "";
                if (Array.isArray(rhsList)) {
                    formattedRhs = rhsList.map(rule => {
                        if (Array.isArray(rule)) {
                            return rule.length === 0 ? 'ε' : rule.join(' ');
                        } else if (typeof rule === 'string') {
                            return rule === '' ? 'ε' : rule;
                        }
                        return String(rule);
                    }).join(' | ');
                } else {
                    formattedRhs = String(rhsList);
                }

                return (
                    <div key={lhs} className="flex items-start gap-2">
                        <span className="font-bold text-mocha-peach min-w-[24px] text-right shrink-0">{lhs}</span>
                        <span className="text-mocha-subtext0 font-bold shrink-0">→</span>
                        <span className="text-mocha-text break-all">{formattedRhs || 'ε'}</span>
                    </div>
                );
            })}
        </div>
    );
};

/**
 * Formats individual cell values for CYK dynamic programming matrix.
 */
const formatCellContent = (cell) => {
    if (cell === null || cell === undefined) return '∅';
    if (Array.isArray(cell)) {
        return cell.length === 0 ? '∅' : `{ ${cell.join(', ')} }`;
    }
    if (typeof cell === 'string') {
        const trimmed = cell.trim();
        if (!trimmed || trimmed === 'ε' || trimmed === '∅' || trimmed === '{}' || trimmed === '[]') return '∅';
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
        if (trimmed.includes(' ')) {
            const parts = trimmed.split(/\s+/).filter(Boolean);
            return `{ ${parts.join(', ')} }`;
        }
        return `{ ${trimmed} }`;
    }
    return String(cell);
};

/**
 * Visual Top-Down Step-Pyramid Table Renderer for CYK Algorithm Matrix.
 * Places row j=N (length N, 1 cell) at TOP down to j=1 (length 1, N cells) at BOTTOM.
 */
const renderCykMatrix = (rawMatrix, word) => {
    const matrix = extractCykMatrix(rawMatrix);
    if (!matrix || !Array.isArray(matrix) || matrix.length === 0) return null;

    const chars = word ? word.split('') : [];
    const N = matrix.length;

    // Create array of row indices from N-1 down to 0 (top row: j=N, bottom row: j=1)
    const reversedRowIndices = Array.from({ length: N }, (_, i) => N - 1 - i);

    return (
        <div className="flex flex-col gap-2 my-2">
            <h4 className="text-xs font-bold text-mocha-mauve uppercase tracking-wider flex items-center gap-2">
                <span>📊</span> CYK Step Matrix Grid
            </h4>
            <div className="overflow-x-auto rounded-xl border border-mocha-surface1 bg-mocha-crust p-4 custom-scrollbar inline-block max-w-full shadow-inner">
                <table className="border-collapse text-xs font-mono min-w-[480px]">
                    <tbody>
                        {reversedRowIndices.map((rIdx) => {
                            const length = rIdx + 1; // j value (1 to N)
                            const rowCells = Array.isArray(matrix[rIdx]) ? matrix[rIdx] : [];

                            return (
                                <tr key={rIdx} className="hover:bg-mocha-surface0/20 transition-colors">
                                    {/* Left Row Header showing Length (j = length) */}
                                    <td className="p-2.5 font-bold text-mocha-teal text-center border border-mocha-surface1 bg-mocha-mantle min-w-[70px] select-none">
                                        j = {length}
                                    </td>

                                    {/* Column Cells: 1 to N */}
                                    {Array.from({ length: N }).map((_, cIdx) => {
                                        const isPopulatedCell = cIdx < (N - length + 1);
                                        const cell = isPopulatedCell ? rowCells[cIdx] : null;
                                        const cellText = isPopulatedCell ? formatCellContent(cell) : '';
                                        const isEmpty = !isPopulatedCell || cellText === '∅';

                                        if (!isPopulatedCell) {
                                            // Empty padding cells to preserve tabular pyramid alignment
                                            return (
                                                <td key={cIdx} className="p-2.5 border border-mocha-surface0/15 bg-mocha-crust/20 min-w-[85px] max-w-[120px]"></td>
                                            );
                                        }

                                        return (
                                            <td
                                                key={cIdx}
                                                className={`p-2.5 text-center border border-mocha-surface1 transition-all min-w-[85px] max-w-[120px] break-words ${
                                                    isEmpty
                                                        ? 'text-mocha-surface2 bg-mocha-mantle/30'
                                                        : 'text-mocha-mauve font-bold bg-mocha-mauve/15 shadow-sm'
                                                }`}
                                            >
                                                {cellText}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}

                        {/* Bottom Row showing terminal input string characters aligned under columns */}
                        <tr className="bg-mocha-mantle/80 border-t-2 border-mocha-mauve/50">
                            <td className="p-2.5 font-bold text-mocha-peach text-center border border-mocha-surface1 select-none">
                                Symbol
                            </td>
                            {Array.from({ length: N }).map((_, cIdx) => (
                                <td key={cIdx} className="p-2.5 text-center border border-mocha-surface1">
                                    <div className="text-[10px] text-mocha-subtext0 select-none">Pos {cIdx + 1}</div>
                                    <div className="text-mocha-green font-bold text-sm font-mono">
                                        {chars[cIdx] ? `'${chars[cIdx]}'` : '-'}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MachineDescription = ({ machineData, automatonType }) => {

    // 1. CYK Algorithm View Router
    if (machineData?.word !== undefined || automatonType === 'CYK' || machineData?.accepted !== undefined) {
        const mainMatrix = extractCykMatrix(machineData.matrix) || 
                           extractCykMatrix(machineData.cyk_matrix) || 
                           extractCykMatrix(machineData.table) || 
                           extractCykMatrix(machineData.dp_table) ||
                           extractCykMatrix(machineData.partitions);

        return (
            <div className="flex flex-col gap-6 max-w-full">
                <div className="flex items-center justify-between border-b border-mocha-surface0 pb-3">
                    <div>
                        <h3 className="text-xl font-bold text-mocha-mauve">CYK Algorithm Evaluation</h3>
                        <p className="text-xs text-mocha-subtext0 mt-0.5 font-mono">Dynamic Programming Membership Decision</p>
                    </div>
                    {automatonType && (
                        <span className="bg-mocha-surface0 text-mocha-mauve border border-mocha-surface1 px-2.5 py-1 rounded text-xs font-bold tracking-wider font-mono">
                            {automatonType.replace(/_/g, ' ')}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-mocha-crust border border-mocha-surface1 p-3 rounded-lg">
                        <span className="text-[10px] font-bold text-mocha-subtext0 uppercase tracking-wider block mb-1">Target Word</span>
                        <span className="font-mono text-mocha-text text-sm break-words">
                            {machineData.word === "" ? "ε (Empty String)" : (machineData.word ?? 'N/A')}
                        </span>
                    </div>
                    <div className="bg-mocha-crust border border-mocha-surface1 p-3 rounded-lg">
                        <span className="text-[10px] font-bold text-mocha-subtext0 uppercase tracking-wider block mb-1">Status</span>
                        <span className={`font-mono text-sm font-bold tracking-wider ${machineData.accepted ? 'text-mocha-green' : 'text-mocha-red'}`}>
                            {machineData.accepted ? '✓ ACCEPTED' : '✗ REJECTED'}
                        </span>
                    </div>
                </div>

                {/* Render Main CYK Pyramid Matrix */}
                {renderCykMatrix(mainMatrix, machineData.word)}

                {/* Step-by-Step Derivation & Execution steps */}
                {machineData.derivation_steps && machineData.derivation_steps.length > 0 && (
                    <div className="flex flex-col gap-3 mt-2">
                        <h4 className="text-sm font-bold text-mocha-teal flex items-center gap-2">
                            <span>📝</span> Step-by-Step Execution
                        </h4>
                        {machineData.derivation_steps.map((step, idx) => {
                            const stepMatrix = extractCykMatrix(step.matrix) || extractCykMatrix(step.partitions);

                            return (
                                <div key={idx} className="bg-mocha-crust border border-mocha-surface1 p-4 rounded-lg shadow-inner flex flex-col gap-2">
                                    <div className="text-sm text-mocha-subtext0 font-mono whitespace-pre-wrap leading-relaxed font-medium">
                                        {step.step_description}
                                    </div>
                                    
                                    {/* Render as visual pyramid matrix if step contains matrix row keys */}
                                    {stepMatrix && stepMatrix.length > 0 ? (
                                        renderCykMatrix(stepMatrix, machineData.word)
                                    ) : (
                                        renderPartitions(step.partitions)
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // 2. CFG View Router (Simplify CFG & CFG to CNF)
    if (machineData?.productions) {
        const { variables, terminals, start_variable, productions, derivation_steps } = machineData;
        return (
            <div className="flex flex-col gap-6 max-w-full">
                <div className="flex items-center justify-between border-b border-mocha-surface0 pb-3">
                    <div>
                        <h3 className="text-xl font-bold text-mocha-mauve">Context-Free Grammar</h3>
                        <p className="text-xs text-mocha-subtext0 mt-0.5 font-mono">G = (V, Σ, R, S)</p>
                    </div>
                    {automatonType && (
                        <span className="bg-mocha-surface0 text-mocha-mauve border border-mocha-surface1 px-2.5 py-1 rounded text-xs font-bold tracking-wider font-mono">
                            {automatonType.replace(/_/g, ' ')}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-mocha-crust border border-mocha-surface1 p-3 rounded-lg">
                        <span className="text-[10px] font-bold text-mocha-subtext0 uppercase tracking-wider block mb-1">Variables (V)</span>
                        <span className="font-mono text-mocha-text text-xs break-words">{variables ? `{ ${variables.join(', ')} }` : '∅'}</span>
                    </div>

                    <div className="bg-mocha-crust border border-mocha-surface1 p-3 rounded-lg">
                        <span className="text-[10px] font-bold text-mocha-subtext0 uppercase tracking-wider block mb-1">Terminals (Σ)</span>
                        <span className="font-mono text-mocha-blue text-xs break-words">{terminals ? `{ ${terminals.join(', ')} }` : '∅'}</span>
                    </div>

                    <div className="bg-mocha-crust border border-mocha-surface1 p-3 rounded-lg">
                        <span className="text-[10px] font-bold text-mocha-subtext0 uppercase tracking-wider block mb-1">Start Variable (S)</span>
                        <span className="font-mono text-mocha-green text-xs font-bold">{start_variable ?? 'None'}</span>
                    </div>
                </div>

                {productions && Object.keys(productions).length > 0 && (
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-bold text-mocha-mauve">Final Grammar Rules (R)</h4>
                        <div className="bg-mocha-crust border border-mocha-surface1 p-4 rounded-lg overflow-x-auto shadow-inner font-mono text-sm text-mocha-text">
                            {Object.entries(productions).map(([lhs, rhsArray]) => {
                                const formattedRhs = Array.isArray(rhsArray)
                                    ? rhsArray.map(r => Array.isArray(r) ? r.join(' ') : r).join(' | ')
                                    : String(rhsArray);
                                return (
                                    <div key={lhs} className="mb-1.5 flex gap-2">
                                        <span className="font-bold text-mocha-peach min-w-[20px] text-right">{lhs}</span>
                                        <span className="text-mocha-subtext0 font-bold">→</span>
                                        <span>{formattedRhs}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {derivation_steps && derivation_steps.length > 0 && (
                    <div className="flex flex-col gap-3 mt-2">
                        <h4 className="text-sm font-bold text-mocha-teal flex items-center gap-2">
                            <span>🔄</span> Transformation Steps
                        </h4>
                        {derivation_steps.map((step, idx) => (
                            <div key={idx} className="bg-mocha-crust border border-mocha-surface1 p-4 rounded-lg shadow-inner flex flex-col gap-2">
                                <div className="text-sm text-mocha-subtext0 font-mono whitespace-pre-wrap leading-relaxed font-medium">
                                    {step.step_description}
                                </div>
                                {renderPartitions(step.partitions)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // 3. Standard Automaton FSM Router (DFAs, NFAs, ENFAs)
    const normalized = extractNormalizedMachineData(machineData);
    if (!normalized || !normalized.states || normalized.states.length === 0) {
        return (
            <div className="text-mocha-subtext0 font-mono text-sm">
                No description generated yet. Compile an automaton or execute an algorithm to view mathematical details here.
            </div>
        );
    }

    const { states, startState, acceptStates, stateMappings, epsilonClosures, transitions, alphabet, hasEpsilon } = normalized;

    const formatStateLabel = (state) => {
        let prefix = "";
        if (state === startState) prefix += "→ ";
        if (acceptStates.includes(state)) prefix += "* ";
        return prefix + state;
    };

    const getCellTargets = (state, symbol, isEpsCell = false) => {
        const stateTrans = transitions[state] || {};
        
        if (isEpsCell) {
            const epsKeys = ['', 'ε', 'epsilon', 'eps', '$'];
            for (const key of epsKeys) {
                if (stateTrans[key] && stateTrans[key].length > 0) {
                    return stateTrans[key];
                }
            }
            return [];
        }

        return stateTrans[symbol] || [];
    };

    return (
        <div className="flex flex-col gap-6 max-w-full">
            <div className="flex items-center justify-between border-b border-mocha-surface0 pb-3">
                <div>
                    <h3 className="text-xl font-bold text-mocha-mauve">Machine Description</h3>
                    <p className="text-xs text-mocha-subtext0 mt-0.5 font-mono">
                        M = (Q, Σ, δ, q₀, F)
                    </p>
                </div>
                {automatonType && (
                    <span className="bg-mocha-surface0 text-mocha-mauve border border-mocha-surface1 px-2.5 py-1 rounded text-xs font-bold tracking-wider font-mono">
                        {automatonType.replace(/_/g, ' ')}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-mocha-crust border border-mocha-surface1 p-3 rounded-lg">
                    <span className="text-[10px] font-bold text-mocha-subtext0 uppercase tracking-wider block mb-1">
                        States (Q)
                    </span>
                    <span className="font-mono text-mocha-text text-xs break-words">
                        {`{ ${states.join(', ')} }`}
                    </span>
                </div>

                <div className="bg-mocha-crust border border-mocha-surface1 p-3 rounded-lg">
                    <span className="text-[10px] font-bold text-mocha-subtext0 uppercase tracking-wider block mb-1">
                        Alphabet (Σ)
                    </span>
                    <span className="font-mono text-mocha-blue text-xs break-words">
                        {`{ ${alphabet.join(', ')} }`}
                    </span>
                </div>

                <div className="bg-mocha-crust border border-mocha-surface1 p-3 rounded-lg">
                    <span className="text-[10px] font-bold text-mocha-subtext0 uppercase tracking-wider block mb-1">
                        Start State (q₀)
                    </span>
                    <span className="font-mono text-mocha-green text-xs font-bold">
                        {startState ?? 'None'}
                    </span>
                </div>

                <div className="bg-mocha-crust border border-mocha-surface1 p-3 rounded-lg">
                    <span className="text-[10px] font-bold text-mocha-subtext0 uppercase tracking-wider block mb-1">
                        Accept States (F)
                    </span>
                    <span className="font-mono text-mocha-red text-xs break-words">
                        {acceptStates.length > 0 ? `{ ${acceptStates.join(', ')} }` : '∅'}
                    </span>
                </div>
            </div>

            {stateMappings && Object.keys(stateMappings).length > 0 && (
                <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-bold text-mocha-mauve">State Mappings</h4>
                    <div className="overflow-x-auto rounded-lg border border-mocha-surface1 max-w-xl">
                        <table className="w-full text-xs text-left border-collapse bg-mocha-crust">
                            <thead>
                                <tr className="bg-mocha-mantle border-b border-mocha-surface1">
                                    <th className="px-3 py-2 font-bold text-mocha-peach border-r border-mocha-surface1 w-1/3">
                                        Derived State
                                    </th>
                                    <th className="px-3 py-2 font-bold text-mocha-mauve">
                                        Original NFA / Set Partition
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(stateMappings).map(([alias, original], idx) => (
                                    <tr key={alias} className={`border-b border-mocha-surface1/40 hover:bg-mocha-surface0/30 ${idx % 2 === 0 ? 'bg-mocha-base/20' : ''}`}>
                                        <td className="px-3 py-1.5 font-mono font-bold text-mocha-peach border-r border-mocha-surface1">
                                            {alias}
                                        </td>
                                        <td className="px-3 py-1.5 font-mono text-mocha-text">
                                            {Array.isArray(original) 
                                                ? `{ ${original.join(', ')} }` 
                                                : (typeof original === 'object' ? JSON.stringify(original) : String(original))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {epsilonClosures && Object.keys(epsilonClosures).length > 0 && (
                <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-bold text-mocha-teal">ε-Closures</h4>
                    <div className="overflow-x-auto rounded-lg border border-mocha-surface1 max-w-xl">
                        <table className="w-full text-xs text-left border-collapse bg-mocha-crust">
                            <thead>
                                <tr className="bg-mocha-mantle border-b border-mocha-surface1">
                                    <th className="px-3 py-2 font-bold text-mocha-teal border-r border-mocha-surface1 w-1/3">
                                        State
                                    </th>
                                    <th className="px-3 py-2 font-bold text-mocha-subtext0">
                                        ε-Closure Set
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(epsilonClosures).map(([st, closure], idx) => (
                                    <tr key={st} className={`border-b border-mocha-surface1/40 hover:bg-mocha-surface0/30 ${idx % 2 === 0 ? 'bg-mocha-base/20' : ''}`}>
                                        <td className="px-3 py-1.5 font-mono font-bold text-mocha-teal border-r border-mocha-surface1">
                                            {st}
                                        </td>
                                        <td className="px-3 py-1.5 font-mono text-mocha-text">
                                            {Array.isArray(closure) ? `{ ${closure.join(', ')} }` : String(closure)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-mocha-mauve">Transition Matrix (δ)</h4>
                <div className="overflow-x-auto custom-scrollbar rounded-lg border border-mocha-surface1 inline-block max-w-full">
                    <table className="w-auto text-xs text-left border-collapse bg-mocha-crust">
                        <thead>
                            <tr className="bg-mocha-mantle border-b border-mocha-surface1">
                                <th className="px-3 py-2 border-r border-mocha-surface1 text-mocha-mauve font-bold whitespace-nowrap min-w-[100px]">
                                    State \ Symbol
                                </th>
                                {alphabet.map(symbol => (
                                    <th key={symbol} className="px-3 py-2 border-r border-mocha-surface1 text-mocha-blue font-bold text-center min-w-[80px]">
                                        {symbol}
                                    </th>
                                ))}
                                {hasEpsilon && (
                                    <th className="px-3 py-2 border-r border-mocha-surface1 text-mocha-teal font-bold text-center min-w-[80px]">
                                        ε
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {states.map((state, idx) => (
                                <tr key={state} className={`hover:bg-mocha-surface0/40 transition-colors border-b border-mocha-surface1/40 ${idx % 2 === 0 ? 'bg-mocha-base/20' : ''}`}>
                                    <td className="px-3 py-1.5 border-r border-mocha-surface1 font-mono font-bold text-mocha-text whitespace-nowrap">
                                        {formatStateLabel(state)}
                                    </td>
                                    
                                    {alphabet.map(symbol => {
                                        const targets = getCellTargets(state, symbol, false);
                                        const display = targets.length > 0 ? `{ ${targets.join(', ')} }` : '∅';
                                        return (
                                            <td key={symbol} className="px-3 py-1.5 border-r border-mocha-surface1 font-mono text-mocha-subtext0 text-center whitespace-nowrap">
                                                {display}
                                            </td>
                                        );
                                    })}

                                    {hasEpsilon && (() => {
                                        const targets = getCellTargets(state, '', true);
                                        const display = targets.length > 0 ? `{ ${targets.join(', ')} }` : '∅';
                                        return (
                                            <td key="epsilon-cell" className="px-3 py-1.5 border-r border-mocha-surface1 font-mono text-mocha-teal text-center whitespace-nowrap">
                                                {display}
                                            </td>
                                        );
                                    })()}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MachineDescription;