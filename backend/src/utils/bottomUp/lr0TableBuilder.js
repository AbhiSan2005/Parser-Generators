export const EPSILON = 'ε';

export const buildLR0Table = (augmentedGrammar, states, transitions) => {
    const { terminals, variables, start_variable, productions } = augmentedGrammar;
    
    const action = {};
    const goto = {};
    const conflicts = [];
    
    // We need to include the end marker '$' as a valid column for reductions
    const allTerminals = [...terminals, '$'];
    
    // 1. Flatten productions into an indexed array (r0, r1, r2...)
    const flatRules = [];
    for (const variable of variables) {
        if (productions[variable]) {
            for (const rule of productions[variable]) {
                flatRules.push({ variable, rule });
            }
        }
    }
    
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

        // --- PART A: Reductions (The LR(0) way: Blindly reduce everywhere) ---
        for (const item of state) {
            if (item.dot >= item.rule.length || item.rule[0] === EPSILON) {
                
                if (item.variable === start_variable) {
                    // Accept state only goes in the '$' column
                    if (action[i]['$'] && action[i]['$'] !== 'acc') {
                        conflicts.push(`Conflict at Action[${i}]['$']: ${action[i]['$']} vs acc`);
                    }
                    action[i]['$'] = 'acc';
                } else {
                    // LR(0) WEAKNESS: We ignore FOLLOW sets. We put the reduction in EVERY terminal column!
                    const ruleIdx = getRuleIndex(item.variable, item.rule);
                    const newAction = `r${ruleIdx}`;
                    
                    for (const terminal of allTerminals) {
                        if (action[i][terminal] && action[i][terminal] !== newAction) {
                            conflicts.push(`Shift/Reduce or Reduce/Reduce Conflict at Action[${i}]['${terminal}']: ${action[i][terminal]} vs ${newAction}`);
                        } else {
                            action[i][terminal] = newAction;
                        }
                    }
                }
            }
        }

        // --- PART B: Shifts and Gotos (Identical to SLR1) ---
        const stateTransitions = transitions[i] || {};
        for (const [symbol, targetState] of Object.entries(stateTransitions)) {
            
            if (terminals.includes(symbol)) {
                const newAction = `s${targetState}`;
                if (action[i][symbol] && action[i][symbol] !== newAction) {
                    conflicts.push(`Conflict at Action[${i}]['${symbol}']: ${action[i][symbol]} vs ${newAction}`);
                } else {
                    action[i][symbol] = newAction;
                }
            } else if (variables.includes(symbol)) {
                goto[i][symbol] = targetState;
            }
        }
    }

    return { 
        action, 
        goto, 
        conflicts,
        has_conflicts: conflicts.length > 0,
        indexed_rules: flatRules 
    };
};