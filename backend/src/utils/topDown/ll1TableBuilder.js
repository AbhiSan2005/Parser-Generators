import { EPSILON } from '../nullable.js';
import { computeFirstOfSequence } from '../firstSets.js';

export const buildLL1Table = (cfgData, firstSets, followSets, nullableSet) => {
    const { terminals, variables, productions } = cfgData;
    const table = {};
    const conflicts = [];

    variables.forEach(nt => {
        table[nt] = {};
    });

    for (const nt of variables) {
        const rules = productions[nt] || [];

        for (const rule of rules) {
            const firstOfRule = computeFirstOfSequence(rule, firstSets, nullableSet);

            for (const terminal of firstOfRule) {
                if (terminal !== EPSILON) {
                    if (table[nt][terminal] && JSON.stringify(table[nt][terminal]) !== JSON.stringify(rule)) {
                        conflicts.push(`Conflict at M[${nt}, ${terminal}]: ${JSON.stringify(table[nt][terminal])} vs ${JSON.stringify(rule)}`);
                    }
                    table[nt][terminal] = rule;
                }
            }

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