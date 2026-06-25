// Thompsons Construction Algorithm

export const EPSILON = 'ε';
let tempIdCounter = 0;

export const resetTempIdCounter = () => {
    tempIdCounter = 0;
}

// Class to hold Single States of ENFA
class State {
    constructor() {
        this.id = `temp${tempIdCounter++}`
        this.transitions = [];
    }
}

// Class to hold smaller enfa fragments and finally the entire ENFA
class ENFAFragment {
    constructor(startState, finalState) {
        this.start = startState;
        this.final = finalState;
    }
}

export const createBaseState = (symbol) => {
    const start = new State();
    const final = new State();
    start.transitions.push({symbol: symbol, toState: final})
    return new ENFAFragment(start, final);
}

export const concatENFA = (left, right) => {
    left.final.transitions.push({
        symbol: EPSILON,
        toState: right.start
    })
    return new ENFAFragment(left.start, right.final)
}

export const unionENFA = (left, right) => {
    const newStart = new State();
    const newFinal = new State();
    newStart.transitions.push({
        symbol: EPSILON,
        toState: left.start
    })
    newStart.transitions.push({
        symbol: EPSILON,
        toState: right.start
    })
    left.final.transitions.push({
        symbol: EPSILON,
        toState: newFinal
    })
    right.final.transitions.push({
        symbol: EPSILON,
        toState: newFinal
    })

    return new ENFAFragment(newStart, newFinal)
}

export const kleeneClosureENFA = (enfaFrag) => {
    const newStart = new State();
    const newFinal = new State();

    newStart.transitions.push({
        symbol: EPSILON,
        toState: enfaFrag.start
    })
    newStart.transitions.push({
        symbol: EPSILON,
        toState: newFinal
    })
    enfaFrag.final.transitions.push({
        symbol: EPSILON,
        toState: enfaFrag.start
    })
    enfaFrag.final.transitions.push({
        symbol: EPSILON,
        toState: newFinal
    })

    return new ENFAFragment(newStart, newFinal);
}

export const calculateEpsilonClosures = (states, adjacency_list) => {
    const epsilon_closures = {}

    for (const state of states) {
        const setofStates = new Set([state])
        const stack = [state]

        while(stack.length > 0) {
            const currState = stack.pop();

            if(adjacency_list[currState] && adjacency_list[currState][EPSILON]) {
                
                for (const nextState of adjacency_list[currState][EPSILON]) {
                    if(!setofStates.has(nextState)) {
                        setofStates.add(nextState)
                        stack.push(nextState)
                    }
                }
            }
        }

        epsilon_closures[state] = [...setofStates].sort((a, b) =>
            parseInt(a.slice(1)) - parseInt(b.slice(1))
        )
    }

    return epsilon_closures;
}