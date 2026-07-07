const EPS = 'ε';
const PHI = '∅';

// Regex helpers functions
const union = (r1, r2) => {
    if (!r1 || r1 === PHI) return r2;
    if (!r2 || r2 === PHI) return r1;
    if (r1 === r2) return r1;
    return `${r1}+${r2}`;
};

const concat = (r1, r2) => {
    if (!r1 || r1 === PHI || !r2 || r2 === PHI) return PHI;
    if (r1 === EPS) return r2;
    if (r2 === EPS) return r1;

    const wrap1 = r1.includes('+') ? `(${r1})` : r1;
    const wrap2 = r2.includes('+') ? `(${r2})` : r2;
    return `${wrap1}${wrap2}`;
};

const star = (r) => {
    if (!r || r === PHI || r === EPS) return EPS;
    if (r.length === 1) return `${r}*`;
    if (r.startsWith('(') && r.endsWith(')*')) return r; 
    return `(${r})*`;
};

// Graphviz DOT Generator for generating graphs data for frontend
const generateDotString = (activeStates, gnfaMatrix) => {
    let dot = 'digraph G {\n  rankdir=LR;\n';
    dot += '  node [shape = circle];\n';
    dot += '  qs [style=filled, fillcolor=lightgrey, label="qs"];\n';
    dot += '  qf [shape=doublecircle, label="qf"];\n';

    activeStates.forEach(from => {
        activeStates.forEach(to => {
            const label = gnfaMatrix[from][to];
            if (label && label !== PHI) {
                dot += `  "${from}" -> "${to}" [label="${label}"];\n`;
            }
        });
    });
    
    dot += '}';
    return dot;
};

export const dfa_to_regex_gnfa = (dfaData, userEliminationOrder = null) => {
    const { states, initial_states, final_states, transitions } = dfaData;
    
    const derivation_steps = [];
    const qs = "qs";
    const qf = "qf";
    
    const orderToRip = (userEliminationOrder && userEliminationOrder.length === states.length) 
        ? userEliminationOrder 
        : states;

    let activeStates = new Set([...states, qs, qf]);
    let gnfa = {};

    // 1. Initialize empty GNFA matrix
    activeStates.forEach(s => {
        gnfa[s] = {};
    });

    // 2. Populate with existing DFA transitions
    transitions.forEach(t => {
        gnfa[t.from][t.to] = union(gnfa[t.from][t.to], t.symbol);
    });

    // 3. Connect new start and final states
    initial_states.forEach(s => {
        gnfa[qs][s] = EPS;
    });
    final_states.forEach(s => {
        gnfa[s][qf] = EPS;
    });

    // Snapshot: Initial GNFA Configuration
    derivation_steps.push({
        step_description: "Step 0: Convert DFA to GNFA. Added new start state (qs) and new final state (qf) with ε-transitions.",
        dot_string: generateDotString(activeStates, gnfa)
    });

    // 4. Eliminate States One by One using the determined order
    for (const qrip of orderToRip) {
        const inStates = [];
        const outStates = [];
        
        // Find paths going in and out of the state to be ripped
        activeStates.forEach(s => {
            if (s !== qrip && gnfa[s][qrip] && gnfa[s][qrip] !== PHI) inStates.push(s);
            if (s !== qrip && gnfa[qrip][s] && gnfa[qrip][s] !== PHI) outStates.push(s);
        });

        const loopRegex = gnfa[qrip][qrip]; 
        const loopStar = star(loopRegex);

        // Compute new paths bypassing qrip
        for (const qi of inStates) {
            for (const qo of outStates) {
                const inEdge = gnfa[qi][qrip];
                const outEdge = gnfa[qrip][qo];
                
                // R_new = R_old ∪ (R_in · R_loop* · R_out)
                const pathThrough = concat(inEdge, concat(loopStar, outEdge));
                gnfa[qi][qo] = union(gnfa[qi][qo], pathThrough);
            }
        }

        // Rip the state from the matrix
        activeStates.delete(qrip);
        delete gnfa[qrip];
        activeStates.forEach(s => {
            delete gnfa[s][qrip];
        });

        // Snapshot: Post-Elimination GNFA
        derivation_steps.push({
            step_description: `Eliminated state ${qrip}. Recomputed paths bypassing ${qrip} using formula: R_old U (R_in · R_loop* · R_out).`,
            dot_string: generateDotString(activeStates, gnfa)
        });
    }

    // 5. Final Extraction
    const finalRegex = gnfa[qs][qf] || PHI;

    return {
        regex: finalRegex,
        derivation_steps: derivation_steps
    };
};