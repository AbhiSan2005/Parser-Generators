import { CfgSimplificationService } from './cfgSimplificationService.js';
import { handleStartVariable, isolateTerminals, binarizeRules } from '../utils/cnfConversion.js';

export const CfgToCnfService = (rawGrammarData) => {
    // 1. AUTO-RUN SIMPLIFICATION FIRST
    const simplifiedGrammar = CfgSimplificationService(rawGrammarData);
    
    let { variables, terminals, start_variable, productions, derivation_steps } = simplifiedGrammar;

    // ==========================================
    // CNF Phase
    // ==========================================

    // STEP 4: Handle Start Variable 
    const startResult = handleStartVariable(variables, start_variable, productions);
    variables = startResult.newVariables;
    start_variable = startResult.newStart;
    productions = startResult.newProductions;

    if (startResult.changed) {
        derivation_steps.push({
            step_description: `Step 4 (CNF): Original start variable was on the RHS. Created new isolated start variable: ${start_variable}.`,
            partitions: productions
        });
    }

    // STEP 5: Isolate Terminals
    const termResult = isolateTerminals(variables, terminals, productions);
    variables = termResult.newVariables;
    productions = termResult.newProductions;

    const mappedTermStrings = Object.entries(termResult.mappedTerminals)
        .map(([term, v]) => `${v} -> ${term}`).join(', ');

    derivation_steps.push({
        step_description: `Step 5 (CNF): Isolated mixed terminals. Replaced terminals in long rules with dedicated variables: ${mappedTermStrings || 'None required'}.`,
        partitions: productions
    });

    // STEP 6: Binarize Long Rules
    const binResult = binarizeRules(variables, productions);
    variables = binResult.newVariables;
    productions = binResult.newProductions;

    derivation_steps.push({
        step_description: `Step 6 (CNF): Binarized long rules. Cascaded rules with >2 symbols into binary trees. New variables: { ${binResult.addedVars.join(', ') || 'None required'} }.`,
        partitions: productions
    });

    // Return the final formatted JSON for the IDE
    return {
        variables,
        terminals,
        start_variable,
        productions,
        derivation_steps
    };
};