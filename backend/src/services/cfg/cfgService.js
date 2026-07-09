import { 
    compute_nullable, 
    compute_first_sets, 
    compute_follow_sets, 
    build_ll1_table,
    EPSILON 
} from '../../utils/cfg_core_algos.js';

export const analyzeCFG = (cfgData) => {
    if (!cfgData.terminals || !cfgData.non_terminals || !cfgData.start_symbol || !cfgData.productions) {
        throw new Error("Invalid CFG structure. Must contain terminals, non_terminals, start_symbol, and productions.");
    }

    const nullableSet = compute_nullable(cfgData);
    const firstSets = compute_first_sets(cfgData, nullableSet);
    const followSets = compute_follow_sets(cfgData, firstSets, nullableSet);
    const ll1Result = build_ll1_table(cfgData, firstSets, followSets, nullableSet);

    return {
        original_cfg: cfgData,
        analysis: {
            nullable_non_terminals: [...nullableSet],
            first_sets: firstSets,
            follow_sets: followSets
        },
        parser_data: {
            parsing_table: ll1Result.table,
            is_ll1_compliant: ll1Result.is_ll1,
            conflicts: ll1Result.conflicts
        }
    };
};