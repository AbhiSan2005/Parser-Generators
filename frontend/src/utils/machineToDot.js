export const normalizeTransitions = (transitions) => {
    const normalized = [];
    if (!transitions) return normalized;

    if (Array.isArray(transitions)) {
        transitions.forEach(t => {
            if (Array.isArray(t)) {
                normalized.push({ from: t[0], input: t[1], to: t[2] });
            } else if (typeof t === 'object') {
                const from = t.from || t.source || t.state || t.currentState || t.current;
                const to = t.to || t.target || t.next || t.nextState;
                const input = t.label !== undefined ? t.label : (t.input !== undefined ? t.input : (t.symbol !== undefined ? t.symbol : (t.read !== undefined ? t.read : 'ε')));
                
                const targets = Array.isArray(to) ? to : [to];
                targets.forEach(target => {
                    if (from && target) normalized.push({ from, input, to: target });
                });
            }
        });
    } else if (typeof transitions === 'object') {
        Object.entries(transitions).forEach(([from, inputs]) => {
            Object.entries(inputs).forEach(([input, toData]) => {
                const targets = Array.isArray(toData) ? toData : [toData];
                targets.forEach(to => normalized.push({ from, input, to }));
            });
        });
    }
    return normalized;
};

export const generateDotString = (machineData) => {
    if (!machineData || !machineData.states) return "";

    const startStates = machineData.initial_states || (machineData.start_state ? [machineData.start_state] : []);
    const finalStates = machineData.final_states || machineData.accept_states || [];

    let dotString = `digraph G {\n`;
    dotString += `  rankdir=LR;\n`; 
    dotString += `  bgcolor="transparent";\n`; 
    dotString += `  node [shape=circle, style=filled, fillcolor="#1e1e2e", color="#89b4fa", fontcolor="#cdd6f4", penwidth=2];\n`;
    dotString += `  edge [color="#cba6f7", fontcolor="#cdd6f4", penwidth=1.5];\n`;
    dotString += `  __start [shape=point, style=invis, width=0];\n`; 

    machineData.states.forEach(state => {
        const isAccept = finalStates.includes(state);
        dotString += `  "${state}" [shape=${isAccept ? 'doublecircle' : 'circle'}${isAccept ? ', color="#a6e3a1"' : ''}];\n`;
    });

    startStates.forEach(start => {
        dotString += `  __start -> "${start}";\n`;
    });

    const edges = normalizeTransitions(machineData.transitions);
    edges.forEach(edge => {
        const label = edge.input === '' || edge.input === 'ε' ? 'ε' : edge.input;
        dotString += `  "${edge.from}" -> "${edge.to}" [label=" ${label} "];\n`;
    });

    dotString += `}`;
    return dotString;
};