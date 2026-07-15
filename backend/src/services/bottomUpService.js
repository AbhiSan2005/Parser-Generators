import { augmentGrammar } from '../utils/bottomup/lrAugmenter.js';
import { computeNullable } from '../utils/nullable.js';
import { computeFirstSets } from '../utils/firstSets.js';
import { computeFollowSets } from '../utils/followSets.js';
import { buildLR0States } from '../utils/bottomup/lr0Items.js';
import { buildLR0Table } from '../utils/bottomup/lr0TableBuilder.js';
import { buildSLRTable } from '../utils/bottomup/slrTableBuilder.js';
import { generateLRCode } from '../utils/bottomup/lrCodeGenerator.js';

/**
 * Orchestrates the entire Bottom-Up compilation pipeline.
 * Returns a strictly formatted payload ready to be saved into the Playground DB schema.
 */
export const generateBottomUpParser = (grammar_source, parser_type) => {
    // 1. Preprocess: Augment the grammar (adds the S' -> S rule)
    const augmented = augmentGrammar(grammar_source);

    // 2. Generate Item Sets: LR(0) states form the foundation for BOTH LR0 and SLR1 parsers
    const { states, transitions } = buildLR0States(augmented);

    let tableData;
    let analysis = {
        nullable_variables: [],
        first_sets: {},
        follow_sets: {}
    };

    // 3. Route to the appropriate mathematical table builder
    if (parser_type === 'SLR1') {
        // SLR(1) requires Nullable, First, and Follow sets to resolve conflicts
        const nullableSet = computeNullable(augmented.variables, augmented.productions);
        const firstSets = computeFirstSets(augmented.terminals, augmented.variables, augmented.productions, nullableSet);
        const followSets = computeFollowSets(augmented.variables, augmented.start_variable, augmented.productions, firstSets, nullableSet);
        
        tableData = buildSLRTable(augmented, states, transitions, followSets);

        // Cache the math for the frontend description/debugging panels
        analysis = {
            nullable_variables: [...nullableSet],
            first_sets: firstSets,
            follow_sets: followSets
        };
    } else if (parser_type === 'LR0') {
        // LR(0) does blind reductions, so it skips the First/Follow set math entirely
        tableData = buildLR0Table(augmented, states, transitions);
    } else {
        throw new Error(`Unsupported parser_type: ${parser_type}`);
    }

    // 4. Generate the standalone, exportable JS code
    const generated_code = generateLRCode(augmented, tableData, parser_type);

    // 5. Construct and return the exact schema-compliant payload
    return {
        has_conflicts: tableData.has_conflicts,
        conflicts: tableData.conflicts,
        item_sets: {
            analysis,          // Contains First/Follow sets (if SLR1)
            states,            // The raw LR(0) item arrays
            transitions        // The GOTO state mapping
        },
        parse_table: {
            action: tableData.action,
            goto: tableData.goto,
            indexed_rules: tableData.indexed_rules
        },
        generated_code: {
            javascript: generated_code.javascript,
            python: "", // reserved for future
            cpp: ""     // reserved for future
        }
    };
};