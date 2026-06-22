export const enfa_to_nfa = (enfaData) => {
    const alphabets = enfaData.alphabet;
    const oldFinalStates = new Set(enfaData.final_states);
    
    const states = [...enfaData.states];
    const initial_states = [...enfaData.initial_states];
    const final_states = [];
    const transitions = [];
    const adjacency_list = {};

    for (const state of states) {
        adjacency_list[state] = {};
        
        // 1. Determine if this state is a final state in the NFA
        const closure = enfaData.epsilon_closures[state] || [state];
        const isFinal = closure.some(s => oldFinalStates.has(s));
        if (isFinal) {
            final_states.push(state);
        }

        // 2. Calculate NFA transitions for each valid alphabet symbol
        for (const symbol of alphabets) {
            const reachedStates = new Set();

            // Find all states reachable through (Epsilon Closure -> Symbol)
            for (const closureState of closure) {
                if (enfaData.adjacency_list[closureState] && enfaData.adjacency_list[closureState][symbol]) {
                    enfaData.adjacency_list[closureState][symbol].forEach(s => reachedStates.add(s));
                }
            }

            // Find the Epsilon Closure of all those reached states
            const finalReachedSet = new Set();
            for (const rState of reachedStates) {
                const targetClosure = enfaData.epsilon_closures[rState] || [rState];
                targetClosure.forEach(s => finalReachedSet.add(s));
            }

            if (finalReachedSet.size > 0) {
                const sortedReached = [...finalReachedSet].sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
                adjacency_list[state][symbol] = sortedReached;

                for (const target of sortedReached) {
                    transitions.push({
                        from: state,
                        to: target,
                        symbol: symbol
                    });
                }
            }
        }
    }

    return {
        alphabet: alphabets,
        states: states,
        initial_states: initial_states,
        final_states: final_states,
        transitions: transitions,
        adjacency_list: adjacency_list
    };
};