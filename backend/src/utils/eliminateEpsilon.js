export const eliminateEpsilon = (variables, productions) => {
    let nullable = new Set();
    let changed = true;

    // 1. Find Nullable Variables
    while (changed) {
        changed = false;
        for (const v of variables) {
            if (!productions[v]) continue;
            for (const rule of productions[v]) {
                if (rule.length === 1 && rule[0] === 'ε') {
                    if (!nullable.has(v)) { nullable.add(v); changed = true; }
                } else {
                    const allNullable = rule.every(symbol => nullable.has(symbol));
                    if (allNullable && rule.length > 0) {
                        if (!nullable.has(v)) { nullable.add(v); changed = true; }
                    }
                }
            }
        }
    }

    // 2. Generate combinations excluding ε
    const getCombinations = (body) => {
        if (body.length === 0) return [[]];
        const first = body[0];
        const restCombs = getCombinations(body.slice(1));
        
        const result = [];
        for (const rest of restCombs) {
            result.push([first, ...rest]); // Include the symbol
            if (nullable.has(first)) {
                result.push([...rest]); // Exclude the symbol (if it can be ε)
            }
        }
        return result;
    };

    let newProductions = {};
    const ruleToString = (rule) => (rule.length === 0 ? 'ε' : rule.join(','));

    // 3. Build new productions
    for (const v of variables) {
        newProductions[v] = [];
        let seenRules = new Set();
        if (!productions[v]) continue;

        for (const rule of productions[v]) {
            if (rule.length === 1 && rule[0] === 'ε') continue; // Drop pure ε rules

            const combinations = getCombinations(rule);
            for (const combo of combinations) {
                if (combo.length > 0) { // Don't add newly formed pure ε rules
                    const str = ruleToString(combo);
                    if (!seenRules.has(str)) {
                        seenRules.add(str);
                        newProductions[v].push(combo);
                    }
                }
            }
        }
    }

    return { 
        newProductions, 
        nullableVariables: [...nullable] 
    };
};