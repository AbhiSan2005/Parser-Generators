import { EPSILON } from './nullable.js';

export const computeFirstSets = (terminals, variables, productions, nullableSet) => {
    const firstSets = {};

    // 1. Initialize FIRST sets for terminals (FIRST(a) = {a})
    terminals.forEach(t => firstSets[t] = new Set([t]));
    
    // 2. Initialize empty FIRST sets for variables
    variables.forEach(v => firstSets[v] = new Set());
    firstSets[EPSILON] = new Set([EPSILON]);

    let changed = true;
    while (changed) {
        changed = false;

        for (const variable of variables) {
            const rules = productions[variable] || [];
            
            for (const rule of rules) {
                for (let i = 0; i < rule.length; i++) {
                    const symbol = rule[i];
                    const symbolFirst = firstSets[symbol] || new Set();
                    const currentSize = firstSets[variable].size;

                    // Add everything from symbol's FIRST set (except ε)
                    for (const f of symbolFirst) {
                        if (f !== EPSILON) firstSets[variable].add(f);
                    }

                    // If we reached the end and all previous symbols were nullable, add ε
                    if (i === rule.length - 1 && (nullableSet.has(symbol) || symbol === EPSILON)) {
                        firstSets[variable].add(EPSILON);
                    }

                    // CRITICAL FIX: Evaluate changed BEFORE breaking out of the loop
                    if (firstSets[variable].size > currentSize) {
                        changed = true;
                    }

                    // If this symbol cannot derive ε, stop scanning this rule
                    if (!nullableSet.has(symbol) && symbol !== EPSILON) {
                        break;
                    }
                }
            }
        }
    }

    // Convert Sets to pure Arrays for clean JSON serialization
    const cleanFirstSets = {};
    variables.forEach(v => {
        cleanFirstSets[v] = [...firstSets[v]];
    });

    return cleanFirstSets;
};

// Helper used by Follow Sets and Table Builders
export const computeFirstOfSequence = (sequence, firstSets, nullableSet) => {
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