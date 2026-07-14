import { eliminateEpsilon } from '../utils/eliminateEpsilon.js';
import { eliminateUnit } from '../utils/eliminateUnit.js';
import { eliminateUseless } from '../utils/eliminateUseless.js';

export const CfgSimplificationService = (grammarData) => {
    // Deep clone the input to avoid mutating the original Redux/Mongo state
    let { variables, terminals, start_variable, productions } = JSON.parse(JSON.stringify(grammarData));
    let derivation_steps = [];

    // STEP 1: Eliminate ε-productions
    const epsResult = eliminateEpsilon(variables, productions);
    productions = epsResult.newProductions;
    
    derivation_steps.push({
        step_description: `Step 1: Eliminated ε-productions. Nullable variables identified: { ${epsResult.nullableVariables.join(', ')} }. Generated combinatorial rules excluding ε.`,
        partitions: productions
    });

    // STEP 2: Eliminate Unit Productions
    const unitResult = eliminateUnit(variables, productions);
    productions = unitResult.newProductions;
    
    derivation_steps.push({
        step_description: `Step 2: Eliminated Unit Productions. Found variable dependencies: ${unitResult.unitPairs.map(p => `(${p.from} => ${p.to})`).join(', ')}. Rules were collapsed upward into the parent variable.`,
        partitions: productions
    });

    // STEP 3: Eliminate Useless Symbols
    const uselessResult = eliminateUseless(variables, terminals, start_variable, productions);
    variables = uselessResult.newVariables;
    productions = uselessResult.newProductions;
    
    derivation_steps.push({
        step_description: `Step 3: Eliminated Useless Symbols. \nGenerating variables: { ${uselessResult.generatingList.join(', ')} }. \nReachable variables from Start: { ${uselessResult.reachableList.join(', ')} }. \nPruned disconnected and non-generating paths.`,
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