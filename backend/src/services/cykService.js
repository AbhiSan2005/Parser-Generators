import { buildCykTable } from '../utils/cykAlgorithm.js';

export const CykService = (cnfGrammarData, word) => {
    // 1. Extract the CNF grammar components
    const { variables, start_variable, productions } = cnfGrammarData;

    // 2. Reject empty strings immediately (as per our no-epsilon rule)
    if (!word || word.length === 0) {
        return {
            word: "",
            accepted: false,
            table_size: 0,
            derivation_steps: [{
                step_description: "Empty string provided. Our grammar does not accept ε. String is REJECTED.",
                partitions: {}
            }]
        };
    }

    // 3. Execute the algorithm
    const { steps, accepted } = buildCykTable(variables, start_variable, productions, word);

    // 4. Return the perfect JSON schema
    return {
        word: word,
        accepted: accepted,
        table_size: word.length,
        derivation_steps: steps
    };
};