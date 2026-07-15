/**
 * Augments a Context-Free Grammar for Bottom-Up Parsing (SLR1 / LR1)
 * Injects a new start variable (e.g., S' -> S) to guarantee a single accept state.
 */
export const augmentGrammar = (grammarData) => {
    const { variables, terminals, start_variable, productions } = grammarData;

    // 1. Generate a unique augmented start variable
    // If the user's start variable is 'E' and 'E'' already exists, this safely makes 'E'''
    let augmentedStart = start_variable + "'";
    while (variables.includes(augmentedStart)) {
        augmentedStart += "'";
    }

    // 2. Clone and update the variables array
    const augmentedVariables = [augmentedStart, ...variables];

    // 3. Clone and update the productions object with the new accept rule
    const augmentedProductions = { ...productions };
    augmentedProductions[augmentedStart] = [[start_variable]];

    // 4. Return the perfectly structured augmented grammar schema
    return {
        variables: augmentedVariables,
        terminals: [...terminals], // Terminals remain completely unchanged
        start_variable: augmentedStart,
        productions: augmentedProductions
    };
};