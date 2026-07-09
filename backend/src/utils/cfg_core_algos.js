export const EPSILON = 'ε';

// Helper to determine which non-terminals can derive ε
export const compute_nullable = (cfgData) => {
    const { non_terminals, productions } = cfgData;
    const nullable = new Set();
    let changed = true;

    while (changed) {
        changed = false;
        for (const nt of non_terminals) {
            if (nullable.has(nt)) continue;

            const rules = productions[nt] || [];
            for (const rule of rules) {
                // If rule is exactly ['ε'], or if every symbol in the rule is nullable
                if (rule.length === 1 && rule[0] === EPSILON) {
                    nullable.add(nt);
                    changed = true;
                    break;
                }
                
                const allNullable = rule.every(symbol => nullable.has(symbol));
                if (rule.length > 0 && allNullable) {
                    nullable.add(nt);
                    changed = true;
                    break;
                }
            }
        }
    }
    return nullable;
};

// Computes FIRST sets for all non-terminals
export const compute_first_sets = (cfgData, nullableSet) => {
    const { terminals, non_terminals, productions } = cfgData;
    const firstSets = {};

    // Initialize FIRST sets
    terminals.forEach(t => firstSets[t] = new Set([t]));
    non_terminals.forEach(nt => firstSets[nt] = new Set());
    firstSets[EPSILON] = new Set([EPSILON]);

    let changed = true;
    while (changed) {
        changed = false;

        for (const nt of non_terminals) {
            const rules = productions[nt] || [];
            
            for (const rule of rules) {
                for (let i = 0; i < rule.length; i++) {
                    const symbol = rule[i];
                    const symbolFirst = firstSets[symbol];
                    const currentSize = firstSets[nt].size;

                    // Add everything from symbol's FIRST set (except ε) to nt's FIRST set
                    for (const f of symbolFirst) {
                        if (f !== EPSILON) firstSets[nt].add(f);
                    }

                    // If this symbol cannot derive ε, we stop looking at subsequent symbols in this rule
                    if (!nullableSet.has(symbol) && symbol !== EPSILON) {
                        break;
                    }

                    // If we reached the last symbol and all previous were nullable, ε belongs in FIRST[nt]
                    if (i === rule.length - 1 && (nullableSet.has(symbol) || symbol === EPSILON)) {
                        firstSets[nt].add(EPSILON);
                    }

                    if (firstSets[nt].size > currentSize) {
                        changed = true;
                    }
                }
            }
        }
    }

    // Convert Sets to Arrays for clean JSON serialization
    const cleanFirstSets = {};
    non_terminals.forEach(nt => {
        cleanFirstSets[nt] = [...firstSets[nt]];
    });

    return cleanFirstSets;
};

export const END_MARKER = '$';

// Helper: Computes the FIRST set of a sequence (array) of symbols
export const compute_first_of_sequence = (sequence, firstSets, nullableSet) => {
    const sequenceFirst = new Set();
    let allNullable = true;

    for (const symbol of sequence) {
        if (symbol === EPSILON) continue;

        const symbolFirst = firstSets[symbol] || new Set([symbol]);
        
        for (const f of symbolFirst) {
            if (f !== EPSILON) sequenceFirst.add(f);
        }

        if (!nullableSet.has(symbol)) {
            allNullable = false;
            break;
        }
    }

    if (allNullable || sequence.length === 0 || sequence[0] === EPSILON) {
        sequenceFirst.add(EPSILON);
    }

    return sequenceFirst;
};

// Computes FOLLOW sets for all non-terminals
export const compute_follow_sets = (cfgData, firstSets, nullableSet) => {
    const { non_terminals, start_symbol, productions } = cfgData;
    const followSets = {};

    non_terminals.forEach(nt => followSets[nt] = new Set());
    
    // Rule 1: Place the end marker in the FOLLOW set of the start symbol
    followSets[start_symbol].add(END_MARKER);

    let changed = true;
    while (changed) {
        changed = false;

        for (const nt of non_terminals) {
            const rules = productions[nt] || [];

            for (const rule of rules) {
                // Iterate through symbols in the current rule
                for (let i = 0; i < rule.length; i++) {
                    const B = rule[i];
                    
                    // We only compute FOLLOW sets for non-terminals
                    if (!non_terminals.includes(B)) continue;

                    const beta = rule.slice(i + 1);
                    const firstOfBeta = compute_first_of_sequence(beta, firstSets, nullableSet);
                    const currentSize = followSets[B].size;

                    // Rule 2: Everything in FIRST(beta) except ε goes into FOLLOW(B)
                    for (const f of firstOfBeta) {
                        if (f !== EPSILON) followSets[B].add(f);
                    }

                    // Rule 3: If ε is in FIRST(beta), or if beta is empty, 
                    // everything in FOLLOW(nt) goes into FOLLOW(B)
                    if (firstOfBeta.has(EPSILON)) {
                        for (const f of followSets[nt]) {
                            followSets[B].add(f);
                        }
                    }

                    if (followSets[B].size > currentSize) {
                        changed = true;
                    }
                }
            }
        }
    }

    const cleanFollowSets = {};
    non_terminals.forEach(nt => {
        cleanFollowSets[nt] = [...followSets[nt]];
    });

    return cleanFollowSets;
};

// Constructs the LL(1) Parsing Table
export const build_ll1_table = (cfgData, firstSets, followSets, nullableSet) => {
    const { terminals, non_terminals, productions } = cfgData;
    const table = {};
    const conflicts = [];

    non_terminals.forEach(nt => {
        table[nt] = {};
    });

    for (const nt of non_terminals) {
        const rules = productions[nt] || [];

        for (const rule of rules) {
            const firstOfRule = compute_first_of_sequence(rule, firstSets, nullableSet);

            // For every terminal 'a' in FIRST(rule), add A -> rule to M[A, a]
            for (const terminal of firstOfRule) {
                if (terminal !== EPSILON) {
                    if (table[nt][terminal] && JSON.stringify(table[nt][terminal]) !== JSON.stringify(rule)) {
                        conflicts.push(`Conflict at M[${nt}, ${terminal}]: ${JSON.stringify(table[nt][terminal])} vs ${JSON.stringify(rule)}`);
                    }
                    table[nt][terminal] = rule;
                }
            }

            // If ε is in FIRST(rule), for every terminal 'b' in FOLLOW(A), add A -> rule to M[A, b]
            if (firstOfRule.has(EPSILON)) {
                const followOfA = followSets[nt] || [];
                for (const terminal of followOfA) {
                    if (table[nt][terminal] && JSON.stringify(table[nt][terminal]) !== JSON.stringify(rule)) {
                        conflicts.push(`Conflict at M[${nt}, ${terminal}]: ${JSON.stringify(table[nt][terminal])} vs ${JSON.stringify(rule)}`);
                    }
                    table[nt][terminal] = rule;
                }
            }
        }
    }

    return { table, conflicts, is_ll1: conflicts.length === 0 };
};