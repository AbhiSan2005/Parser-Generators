export const eliminateUseless = (variables, terminals, start_variable, productions) => {
    
    // 1. Eliminate Non-Generating Variables
    let generating = new Set([...terminals, 'ε']);
    let changed = true;
    
    while (changed) {
        changed = false;
        for (const v of variables) {
            if (generating.has(v)) continue;
            if (!productions[v]) continue;
            for (const rule of productions[v]) {
                if (rule.every(sym => generating.has(sym))) {
                    generating.add(v);
                    changed = true;
                    break;
                }
            }
        }
    }

    // Filter out non-generating vars and their associated rules
    let genVariables = variables.filter(v => generating.has(v));
    let genProductions = {};
    for (const v of genVariables) {
        genProductions[v] = productions[v].filter(rule => rule.every(sym => generating.has(sym)));
    }

    // 2. Eliminate Unreachable Variables
    let reachable = new Set([start_variable]);
    let queue = [start_variable];

    while (queue.length > 0) {
        const current = queue.shift();
        if (!genProductions[current]) continue;
        for (const rule of genProductions[current]) {
            for (const sym of rule) {
                if (genVariables.includes(sym) && !reachable.has(sym)) {
                    reachable.add(sym);
                    queue.push(sym);
                }
            }
        }
    }

    // Final sweep to keep only reachable AND generating variables
    let finalVariables = genVariables.filter(v => reachable.has(v));
    let finalProductions = {};
    for (const v of finalVariables) {
        finalProductions[v] = genProductions[v];
    }

    return {
        newVariables: finalVariables,
        newProductions: finalProductions,
        generatingList: [...generating].filter(v => variables.includes(v)),
        reachableList: [...reachable]
    };
};