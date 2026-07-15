import { EPSILON } from './nullable.js';
import { computeFirstOfSequence } from './firstSets.js';
import { END_MARKER } from './tokenizer.js';

export const computeFollowSets = (variables, startVariable, productions, firstSets, nullableSet) => {
    const followSets = {};

    variables.forEach(v => followSets[v] = new Set());
    
    // Rule 1: Place the end marker ($) in the FOLLOW set of the start variable
    followSets[startVariable].add(END_MARKER);

    let changed = true;
    while (changed) {
        changed = false;

        for (const variable of variables) {
            const rules = productions[variable] || [];

            for (const rule of rules) {
                for (let i = 0; i < rule.length; i++) {
                    const B = rule[i];
                    
                    // We only compute FOLLOW sets for variables
                    if (!variables.includes(B)) continue;

                    const beta = rule.slice(i + 1);
                    const firstOfBeta = computeFirstOfSequence(beta, firstSets, nullableSet);
                    const currentSize = followSets[B].size;

                    // Rule 2: Everything in FIRST(beta) except ε goes into FOLLOW(B)
                    for (const f of firstOfBeta) {
                        if (f !== EPSILON) followSets[B].add(f);
                    }

                    // Rule 3: If ε is in FIRST(beta), or if beta is empty, 
                    // everything in FOLLOW(variable) flows into FOLLOW(B)
                    if (firstOfBeta.has(EPSILON)) {
                        for (const f of followSets[variable]) {
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

    // Convert Sets to pure Arrays for clean JSON serialization
    const cleanFollowSets = {};
    variables.forEach(v => {
        cleanFollowSets[v] = [...followSets[v]];
    });

    return cleanFollowSets;
};