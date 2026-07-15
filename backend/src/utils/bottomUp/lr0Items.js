export const EPSILON = 'ε';

// Helper: Serializes an item into a string to easily check for duplicates
// Example: { variable: 'E', rule: ['T', "E'"], dot: 1 } => "E->T E'@1"
export const serializeItem = (item) => `${item.variable}->${item.rule.join(' ')}@${item.dot}`;

// Helper: Serializes an entire state (array of items) into a unique hash string
export const serializeState = (stateItems) => stateItems.map(serializeItem).sort().join('|');

/**
 * Computes the Closure of a set of items.
 * If the dot is in front of a variable, it pulls in all of that variable's productions.
 */
export const computeClosure = (items, productions) => {
    const closure = [...items];
    const added = new Set(closure.map(serializeItem));

    let changed = true;
    while (changed) {
        changed = false;
        
        for (const item of closure) {
            // If the dot is at the end, or the rule is epsilon (already reduced), skip it
            if (item.dot >= item.rule.length || item.rule[0] === EPSILON) continue;

            const nextSymbol = item.rule[item.dot];
            
            // If the symbol after the dot is a variable, we must expand it
            if (productions[nextSymbol]) {
                for (const rule of productions[nextSymbol]) {
                    // Epsilon rules act as if the dot is already at the end
                    const isEpsilon = rule.length === 1 && rule[0] === EPSILON;
                    const newItem = {
                        variable: nextSymbol,
                        rule: rule,
                        dot: isEpsilon ? 1 : 0 
                    };
                    
                    const serialized = serializeItem(newItem);
                    if (!added.has(serialized)) {
                        added.add(serialized);
                        closure.push(newItem);
                        changed = true;
                    }
                }
            }
        }
    }
    return closure;
};

/**
 * Builds the complete Canonical Collection of LR(0) states and transitions (The DFA).
 */
export const buildLR0States = (augmentedGrammar) => {
    const { variables, terminals, start_variable, productions } = augmentedGrammar;
    const allSymbols = [...variables, ...terminals];
    
    // Create the Initial Item from the Augmented Start Variable (e.g., S' -> . S)
    const initialItem = {
        variable: start_variable,
        rule: productions[start_variable][0],
        dot: 0
    };
    
    const states = []; // Array storing arrays of item objects
    const transitions = {}; // Format: { stateIndex: { symbol: targetStateIndex } }
    const stateMap = new Map(); // Maps serialized state strings to their index
    
    // State 0 is the closure of the initial item
    const i0 = computeClosure([initialItem], productions);
    states.push(i0);
    transitions[0] = {};
    stateMap.set(serializeState(i0), 0);
    
    const queue = [0];
    
    // Breadth-First Search to build the DFA
    while (queue.length > 0) {
        const currentStateIndex = queue.shift();
        const currentState = states[currentStateIndex];
        
        for (const symbol of allSymbols) {
            const gotoItems = [];
            
            // Find all items in the current state where the dot is right before this symbol
            for (const item of currentState) {
                if (item.dot < item.rule.length && item.rule[item.dot] === symbol && item.rule[0] !== EPSILON) {
                    gotoItems.push({
                        ...item,
                        dot: item.dot + 1 // Shift the dot over
                    });
                }
            }
            
            // If we can transition on this symbol, generate the new state
            if (gotoItems.length > 0) {
                const nextState = computeClosure(gotoItems, productions);
                const serializedNext = serializeState(nextState);
                
                // If this is a brand new state, add it to our tracking arrays
                if (!stateMap.has(serializedNext)) {
                    const nextIndex = states.length;
                    states.push(nextState);
                    transitions[nextIndex] = {};
                    stateMap.set(serializedNext, nextIndex);
                    queue.push(nextIndex);
                }
                
                // Record the transition (Goto logic)
                transitions[currentStateIndex][symbol] = stateMap.get(serializedNext);
            }
        }
    }
    
    return { states, transitions };
};