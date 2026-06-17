export const enfa_to_dfa = (enfaData) => {
    const alphabets = enfaData.alphabet;
    const finalStates = new Set(enfaData.final_states);

    const getName = (arr) => {
        return [...new Set(arr)].sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).join(',')
    }

    let startState = new Set();
    for (const initialState of enfaData.initial_states) {
        if(enfaData.epsilon_closures[initialState]) {
            enfaData.epsilon_closures[initialState].forEach(element => {
                startState.add(element)
            });
        }
    }

    const startStateName = getName([...startState]);

    const dfaRawGraph = {}
    const dfaRawFinalStates = new Set();

    const queue = [[...startState]];
    const visitedLongNames = new Set([startStateName]);

    while(queue.length > 0) {
        const currSetofStates = queue.shift();
        const currName = getName(currSetofStates);

        dfaRawGraph[currName] = {}

        if(currSetofStates.some(state => finalStates.has(state))) {
            dfaRawFinalStates.add(currName)
        }

        // Check transitions for each alphabet
        for(const symbol of alphabets) {
            const reachedStates = new Set();

            // All transitions for the current symbol
            for(const state of currSetofStates) {
                if(enfaData.adjacency_list[state] && enfaData.adjacency_list[state][symbol]) {
                    enfaData.adjacency_list[state][symbol].forEach(s => reachedStates.add(s))
                }
            }

            // Epsilon Closures of all reached states
            const targetSet = new Set()
            for(const state of reachedStates) {
                if(enfaData.epsilon_closures[state]) {
                    enfaData.epsilon_closures[state].forEach(s => targetSet.add(s))
                }
            }

            const targetName = getName([...targetSet])
            dfaRawGraph[currName][symbol] = targetName;

            if(!visitedLongNames.has(targetName)) {
                visitedLongNames.add(targetName)
                queue.push([...targetSet])
            }
        }
    }
    // Raw Dfa is generated at this point with long names
    // All states are stored in visitedLongNames
    // All transitions are stored in dfaRawGraph

    let IdCounter = 0;
    const idmap = {}
    const state_mapping = {}

    const getNewName = (longName) => {
        if(idmap[longName] === undefined) {
            const newId = `d${IdCounter++}`
            idmap[longName] = newId

            state_mapping[newId] = (longName === "") ? [] : longName.split(',')
        }

        return idmap[longName]
    }

    getNewName(startStateName);

    const states = []
    const transitions = []
    const adjacency_list = {}
    const final_states = []

    for(const longName of visitedLongNames) {
        const newName = getNewName(longName);
        states.push(newName)
        adjacency_list[newName] = {}

        if(dfaRawFinalStates.has(longName)) {
            final_states.push(newName)
        }

        for(const symbol of alphabets) {
            const targetLongName = dfaRawGraph[longName][symbol]

            const targetNewName = getNewName(targetLongName);

            transitions.push({
                from: newName,
                to: targetNewName,
                symbol: symbol
            })

            if(!adjacency_list[newName][symbol]) {
                adjacency_list[newName][symbol] = []
            }
            adjacency_list[newName][symbol].push(targetNewName)
        }
    }

    // Dfa with new names is ready
    return {
        alphabet: alphabets,
        states: states,
        initial_states: [getNewName(startStateName)],
        final_states: final_states,
        transitions: transitions,
        adjacency_list: adjacency_list,
        state_mapping: state_mapping
    }
}