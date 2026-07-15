import { EPSILON } from '../nullable.js';
import { computeFirstOfSequence } from '../firstSets.js';

// Helper: Serializes an LR(1) item into a string to easily check for duplicates
// Example: { variable: 'S', rule: ['C', 'C'], dot: 1, lookahead: '$' } => "S->C C@1,$"
export const serializeLr1Item = (item) => `${item.variable}->${item.rule.join(' ')}@${item.dot},${item.lookahead}`;

// Helper: Serializes an entire state into a unique hash string
export const serializeLr1State = (stateItems) => stateItems.map(serializeLr1Item).sort().join('|');

/**
 * Computes the Closure of a set of LR(1) items.
 * If the dot is before a variable B (A -> α • B β, a), it adds (B -> • γ, b) 
 * for every terminal 'b' in FIRST(βa).
 */
export const computeLr1Closure = (items, productions, firstSets, nullableSet) => {
    const closure = [...items];
    const added = new Set(closure.map(serializeLr1Item));

    let changed = true;
    while (changed) {
        changed = false;
        
        // Using a standard loop because we are dynamically pushing to this array
        for (let i = 0; i < closure.length; i++) {
            const item = closure[i];
            
            // If the dot is at the end, or the rule is epsilon, skip it
            if (item.dot >= item.rule.length || item.rule[0] === EPSILON) continue;

            const nextSymbol = item.rule[item.dot];
            
            // If the symbol after the dot is a variable, we must expand it
            if (productions[nextSymbol]) {
                // beta is everything AFTER the variable we are expanding
                const beta = item.rule.slice(item.dot + 1);
                
                // The sequence to evaluate is β + current lookahead
                const sequenceToFirst = [...beta, item.lookahead];
                const lookaheads = computeFirstOfSequence(sequenceToFirst, firstSets, nullableSet);

                for (const rule of productions[nextSymbol]) {
                    const isEpsilon = rule.length === 1 && rule[0] === EPSILON;
                    
                    // Create a new item for EVERY valid lookahead terminal
                    for (const lookahead of lookaheads) {
                        if (lookahead === EPSILON) continue;

                        const newItem = {
                            variable: nextSymbol,
                            rule: rule,
                            dot: isEpsilon ? 1 : 0,
                            lookahead: lookahead
                        };
                        
                        const serialized = serializeLr1Item(newItem);
                        if (!added.has(serialized)) {
                            added.add(serialized);
                            closure.push(newItem);
                            changed = true;
                        }
                    }
                }
            }
        }
    }
    return closure;
};

/**
 * Builds the complete Canonical Collection of LR(1) states and transitions.
 */
export const buildLR1States = (augmentedGrammar, firstSets, nullableSet) => {
    const { variables, terminals, start_variable, productions } = augmentedGrammar;
    const allSymbols = [...variables, ...terminals];
    
    // Create the Initial Item: [S' -> • S, $]
    const initialItem = {
        variable: start_variable,
        rule: productions[start_variable][0],
        dot: 0,
        lookahead: '$'
    };
    
    const states = []; 
    const transitions = {}; 
    const stateMap = new Map(); 
    
    const i0 = computeLr1Closure([initialItem], productions, firstSets, nullableSet);
    states.push(i0);
    transitions[0] = {};
    stateMap.set(serializeLr1State(i0), 0);
    
    const queue = [0];
    
    while (queue.length > 0) {
        const currentStateIndex = queue.shift();
        const currentState = states[currentStateIndex];
        
        for (const symbol of allSymbols) {
            const gotoItems = [];
            
            // Find all items where the dot is right before this symbol
            for (const item of currentState) {
                if (item.dot < item.rule.length && item.rule[item.dot] === symbol && item.rule[0] !== EPSILON) {
                    gotoItems.push({
                        ...item,
                        dot: item.dot + 1 
                    });
                }
            }
            
            if (gotoItems.length > 0) {
                const nextState = computeLr1Closure(gotoItems, productions, firstSets, nullableSet);
                const serializedNext = serializeLr1State(nextState);
                
                if (!stateMap.has(serializedNext)) {
                    const nextIndex = states.length;
                    states.push(nextState);
                    transitions[nextIndex] = {};
                    stateMap.set(serializedNext, nextIndex);
                    queue.push(nextIndex);
                }
                
                transitions[currentStateIndex][symbol] = stateMap.get(serializedNext);
            }
        }
    }
    
    return { states, transitions };
};