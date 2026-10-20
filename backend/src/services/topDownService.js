import { preprocessLL1 } from '../utils/topDown/ll1Preprocessor.js';
import { computeNullable } from '../utils/nullable.js';
import { computeFirstSets } from '../utils/firstSets.js';
import { computeFollowSets } from '../utils/followSets.js';
import { buildLL1Table } from '../utils/topDown/ll1TableBuilder.js';
import { generateLL1Code } from '../utils/topDown/ll1CodeGenerator.js';
import { simulateLL1 } from '../utils/topDown/ll1Engine.js';

export const runLL1Pipeline = (cfgData) => {
    // 1. Sanitize the Grammar (Left Recursion & Left Factoring)
    const sanitizedData = preprocessLL1(cfgData.variables, cfgData.productions);
    
    const variables = sanitizedData.variables;
    const productions = sanitizedData.productions;
    const terminals = cfgData.terminals;
    const start_variable = cfgData.start_variable;

    // 2. Shared Math: Compute Nullable, FIRST, and FOLLOW sets
    const nullableSet = computeNullable(variables, productions);
    const firstSets = computeFirstSets(terminals, variables, productions, nullableSet);
    const followSets = computeFollowSets(variables, start_variable, productions, firstSets, nullableSet);

    // 3. LL(1) Specific: Build Table & Generate Code
    const ll1Result = buildLL1Table({ terminals, variables, productions }, firstSets, followSets, nullableSet);
    
    let generatedCode = null;
    let simulation = null;
    
    if (ll1Result.is_ll1) {
        generatedCode = generateLL1Code(
            { start_variable, variables, terminals }, 
            ll1Result.table, 
            followSets
        );

        // Run a dummy simulation with no tokens just to ensure the engine initializes correctly
        // (The frontend will later ping the engine directly with real user tokens)
        simulation = simulateLL1(ll1Result.table, start_variable, ['$']);
    }

    return {
        original_cfg: cfgData,
        sanitized_cfg: {
            variables,
            productions,
            modified: sanitizedData.changed
        },
        analysis: {
            nullable_variables: [...nullableSet],
            first_sets: firstSets,
            follow_sets: followSets
        },
        parser_data: {
            parsing_table: ll1Result.table,
            is_ll1_compliant: ll1Result.is_ll1,
            conflicts: ll1Result.conflicts,
            generated_code: generatedCode,
            initial_simulation: simulation
        }
    };
};