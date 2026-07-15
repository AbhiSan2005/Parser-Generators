export const EPSILON = 'ε';

export const buildSLRTable = (augmentedGrammar, states, transitions, followSets) => {
    const { terminals, variables, start_variable, productions } = augmentedGrammar;
    
    const action = {};
    const goto = {};
    const conflicts = [];
    
    // 1. Flatten productions into an indexed array (r0, r1, r2...)
    // The parser engine needs to know exactly which rule 'r2' refers to.
    const flatRules = [];
    for (const variable of variables) {
        if (productions[variable]) {
            for (const rule of productions[variable]) {
                flatRules.push({ variable, rule });
            }
        }
    }
    
    // Helper to find the integer index of a rule
    const getRuleIndex = (variable, rule) => {
        return flatRules.findIndex(r => r.variable === variable && JSON.stringify(r.rule) === JSON.stringify(rule));
    };

    // 2. Initialize the table matrices
    for (let i = 0; i < states.length; i++) {
        action[i] = {};
        goto[i] = {};
    }

    // 3. Populate the tables
    for (let i = 0; i < states.length; i++) {
        const state = states[i];

        // --- PART A: Reductions (Using FOLLOW Sets) and Accept ---
        for (const item of state) {
            // An item is ready to reduce if the dot is at the end, or if it's an epsilon rule
            if (item.dot >= item.rule.length || item.rule[0] === EPSILON) {
                
                if (item.variable === start_variable) {
                    // It's the augmented start rule (e.g., E'' -> E •) -> ACCEPT
                    if (action[i]['$'] && action[i]['$'] !== 'acc') {
                        conflicts.push(`Conflict at Action[${i}]['$']: ${action[i]['$']} vs acc`);
                    }
                    action[i]['$'] = 'acc';
                } else {
                    // Standard reduction -> Find the rule number and put it in every terminal of FOLLOW(A)
                    const ruleIdx = getRuleIndex(item.variable, item.rule);
                    const followA = followSets[item.variable] || [];
                    
                    for (const terminal of followA) {
                        const newAction = `r${ruleIdx}`;
                        if (action[i][terminal] && action[i][terminal] !== newAction) {
                            conflicts.push(`Shift/Reduce or Reduce/Reduce Conflict at Action[${i}]['${terminal}']: ${action[i][terminal]} vs ${newAction}`);
                        } else {
                            action[i][terminal] = newAction;
                        }
                    }
                }
            }
        }

        // --- PART B: Shifts and Gotos (Using the DFA Transitions) ---
        const stateTransitions = transitions[i] || {};
        for (const [symbol, targetState] of Object.entries(stateTransitions)) {
            
            if (terminals.includes(symbol)) {
                // Terminals become SHIFT actions
                const newAction = `s${targetState}`;
                if (action[i][symbol] && action[i][symbol] !== newAction) {
                    conflicts.push(`Conflict at Action[${i}]['${symbol}']: ${action[i][symbol]} vs ${newAction}`);
                } else {
                    action[i][symbol] = newAction;
                }
            } else if (variables.includes(symbol)) {
                // Variables become GOTO actions
                goto[i][symbol] = targetState;
            }
        }
    }

    return { 
        action, 
        goto, 
        conflicts,
        has_conflicts: conflicts.length > 0,
        indexed_rules: flatRules // We pass this to the frontend so it knows what r0, r1 means!
    };
};