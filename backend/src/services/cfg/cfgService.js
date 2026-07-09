import { 
    compute_nullable, 
    compute_first_sets, 
    compute_follow_sets, 
    build_ll1_table,
    EPSILON 
} from '../../utils/cfg_core_algos.js';
import { generate_recursive_descent_parser } from '../../utils/parser_generator.js';

import Workspace from '../models/Workspace.js';
import { analyzeCFG } from '../services/cfg/cfgService.js';

export const analyzeAndSaveCFG = async (req, res) => {
    try {
        const { workspace_id, tab_id, tabName, cfg_data } = req.body;
        
        if (!cfg_data) {
            return res.status(400).json({ success: false, error: "Missing cfg_data in request body" });
        }

        const result = analyzeCFG(cfg_data);

        if (workspace_id) {
            const workspace = await Workspace.findOne({ workspace_id });
            
            if (!workspace) {
                return res.status(404).json({ success: false, error: "Workspace not found" });
            }

            const tabPayload = {
                tabName: tabName || 'Untitled CFG',
                language_type: 'CONTEXT_FREE',
                automatonType: 'CFG',
                machine_data: result 
            };

            const existingTabIndex = workspace.tabs.findIndex(t => t.tab_id === tab_id);

            if (existingTabIndex > -1) {
                workspace.tabs[existingTabIndex].tabName = tabPayload.tabName;
                workspace.tabs[existingTabIndex].language_type = tabPayload.language_type;
                workspace.tabs[existingTabIndex].automatonType = tabPayload.automatonType;
                workspace.tabs[existingTabIndex].machine_data = tabPayload.machine_data;
            } else {
                if (tab_id) tabPayload.tab_id = tab_id;
                workspace.tabs.push(tabPayload);
            }

            await workspace.save();
            
            return res.status(200).json({
                success: true,
                message: "CFG analyzed and saved to workspace successfully",
                data: result,
                workspace_id: workspace.workspace_id
            });
        }

        return res.status(200).json({
            success: true,
            message: "CFG analyzed successfully (Not saved to DB)",
            data: result
        });

    } catch (error) {
        console.error("CFG Processing Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error during CFG processing"
        });
    }
};

export const analyzeCFG = (cfgData) => {
    if (!cfgData.terminals || !cfgData.non_terminals || !cfgData.start_symbol || !cfgData.productions) {
        throw new Error("Invalid CFG structure. Must contain terminals, non_terminals, start_symbol, and productions.");
    }

    const nullableSet = compute_nullable(cfgData);
    const firstSets = compute_first_sets(cfgData, nullableSet);
    const followSets = compute_follow_sets(cfgData, firstSets, nullableSet);
    const ll1Result = build_ll1_table(cfgData, firstSets, followSets, nullableSet);

    let generatedCode = null;
    if (ll1Result.is_ll1) {
        generatedCode = generate_recursive_descent_parser(cfgData, ll1Result.table, followSets);
    }

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
            conflicts: ll1Result.conflicts,
            generated_parser_code: generatedCode
        }
    };
};