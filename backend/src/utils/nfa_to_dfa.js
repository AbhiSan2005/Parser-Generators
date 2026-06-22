export const nfa_to_dfa = (nfaData) => {
    const alphabets = nfaData.alphabet;
    const finalStates = new Set(nfaData.final_states);

    const getName = (arr) => {
        return [...new Set(arr)].sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).join(',');
    };

    // Standard NFA initial states combined form the initial DFA state
    const startStateName = getName(nfaData.initial_states);

    const dfaRawGraph = {};
    const dfaRawFinalStates = new Set();

    const queue = [ [...nfaData.initial_states] ];
    const visitedLongNames = new Set([startStateName]);

    while (queue.length > 0) {
        const currSetofStates = queue.shift();
        const currName = getName(currSetofStates);

        dfaRawGraph[currName] = {};

        if (currSetofStates.some(state => finalStates.has(state))) {
            dfaRawFinalStates.add(currName);
        }

        for (const symbol of alphabets) {
            const reachedStates = new Set();

            for (const state of currSetofStates) {
                if (nfaData.adjacency_list[state] && nfaData.adjacency_list[state][symbol]) {
                    nfaData.adjacency_list[state][symbol].forEach(s => reachedStates.add(s));
                }
            }

            const targetName = getName([...reachedStates]);
            dfaRawGraph[currName][symbol] = targetName;

            if (!visitedLongNames.has(targetName)) {
                visitedLongNames.add(targetName);
                queue.push([...reachedStates]);
            }
        }
    }

    let IdCounter = 0;
    const idmap = {};
    const state_mapping = {};

    const getNewName = (longName) => {
        if (idmap[longName] === undefined) {
            const newId = `d${IdCounter++}`;
            idmap[longName] = newId;
            state_mapping[newId] = (longName === "") ? [] : longName.split(',');
        }
        return idmap[longName];
    };

    getNewName(startStateName);

    const states = [];
    const transitions = [];
    const adjacency_list = {};
    const final_states = [];

    for (const longName of visitedLongNames) {
        const newName = getNewName(longName);
        states.push(newName);
        adjacency_list[newName] = {};

        if (dfaRawFinalStates.has(longName)) {
            final_states.push(newName);
        }

        for (const symbol of alphabets) {
            const targetLongName = dfaRawGraph[longName][symbol];
            const targetNewName = getNewName(targetLongName);

            transitions.push({
                from: newName,
                to: targetNewName,
                symbol: symbol
            });

            if (!adjacency_list[newName][symbol]) {
                adjacency_list[newName][symbol] = [];
            }
            adjacency_list[newName][symbol].push(targetNewName);
        }
    }

    return {
        alphabet: alphabets,
        states: states,
        initial_states: [getNewName(startStateName)],
        final_states: final_states,
        transitions: transitions,
        adjacency_list: adjacency_list,
        state_mapping: state_mapping
    };
};