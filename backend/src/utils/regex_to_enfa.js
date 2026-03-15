import Enfa from "../models/Enfa.js";
import { calculateEpsilonClosures, createBaseState, concatENFA, unionENFA, kleeneClosureENFA, resetTempIdCounter } from "./Thompsons_enfa_helpers.js"
import { infix_to_postfix } from "./infix_to_postfix.js";

export const regex_to_enfa = (postfix) => {
    resetTempIdCounter();
    const stack = [];

    // Evaluation of the postfix expression
    for (const ch of postfix) {
        if(/[a-zA-Z0-9]/.test(ch)) {
            stack.push(createBaseState(ch))
        }
        else if(ch === '.') {
            const right = stack.pop()
            const left = stack.pop()
            stack.push(concatENFA(left, right));
        }
        else if(ch === '+') {
            const right = stack.pop()
            const left = stack.pop()
            stack.push(unionENFA(left, right));
        }
        else if(ch === "*") {
            stack.push(kleeneClosureENFA(stack.pop()));
        }
    }

    // Final ENFA but with improper state names
    const finalenfa = stack.pop();
    
    // Formatting the state names
    const states = [] // Q
    const transitions = [] // delta
    const adjacency_list = {} // another way of writing delta

    let finalIdCounter = 0;
    const idMap = {}

    // function to rename the states
    const getCleanId = (tempId) => {
        if(idMap[tempId] === undefined) {
            idMap[tempId] = `q${finalIdCounter++}`;
        }
        return idMap[tempId];
    };

    // bfs algo to rename
    const visited = new Set()
    const queue = [finalenfa.start]

    getCleanId(finalenfa.start.id) // Map the initial state first

    while(queue.length > 0) {
        const currState = queue.shift();

        if(!visited.has(currState.id)) {
            visited.add(currState.id)

            const cleanCurrStateId = getCleanId(currState.id)
            states.push(cleanCurrStateId);
            adjacency_list[cleanCurrStateId] = {}

            for (const t of currState.transitions) {
                const cleanToStateId = getCleanId(t.toState.id)

                transitions.push({
                    from: cleanCurrStateId,
                    to: cleanToStateId,
                    symbol: t.symbol
                });

                if(!adjacency_list[cleanCurrStateId][t.symbol]) {
                    adjacency_list[cleanCurrStateId][t.symbol] = []
                }
                adjacency_list[cleanCurrStateId][t.symbol].push(cleanToStateId);

                if(!visited.has(t.toState.id)) {
                    queue.push(t.toState)
                }
            }
        }

    }

    const epsilon_closures = calculateEpsilonClosures(states, adjacency_list);

    return {
        states: states,
        initial_states: [getCleanId(finalenfa.start.id)],
        final_states: [getCleanId(finalenfa.final.id)],
        transitions: transitions,
        adjacency_list: adjacency_list,
        epsilon_closures: epsilon_closures
    }
}

// console.log(regex_to_enfa("ab+*"));
