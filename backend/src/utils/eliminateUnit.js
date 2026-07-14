export const eliminateUnit = (variables, productions) => {
    let unitPairs = [];
    const ruleToString = (rule) => (rule.length === 0 ? 'ε' : rule.join(','));
    
    // 1. Find all Unit Pairs using DFS/Transitive Closure (A =>* B)
    const getUnitPairs = (currentVar, originalVar, visited) => {
        if (!productions[currentVar]) return;
        for (const rule of productions[currentVar]) {
            if (rule.length === 1 && variables.includes(rule[0])) {
                const target = rule[0];
                if (!visited.has(target)) {
                    visited.add(target);
                    unitPairs.push({ from: originalVar, to: target });
                    getUnitPairs(target, originalVar, visited);
                }
            }
        }
    };

    for (const v of variables) {
        getUnitPairs(v, v, new Set([v]));
    }

    // 2. Add non-unit rules of B directly to A
    let newProductions = {};
    for (const v of variables) {
        newProductions[v] = [];
        let seenRules = new Set();
        
        const addRule = (rule, head) => {
            const str = ruleToString(rule);
            if (!seenRules.has(str)) {
                seenRules.add(str);
                newProductions[head].push(rule);
            }
        };

        // Add original non-unit rules
        if (productions[v]) {
            for (const rule of productions[v]) {
                if (!(rule.length === 1 && variables.includes(rule[0]))) {
                    addRule(rule, v);
                }
            }
        }

        // Add rules from reachable unit pairs
        const targets = unitPairs.filter(p => p.from === v).map(p => p.to);
        for (const target of targets) {
            if (productions[target]) {
                for (const rule of productions[target]) {
                    if (!(rule.length === 1 && variables.includes(rule[0]))) {
                        addRule(rule, v);
                    }
                }
            }
        }
    }

    return { 
        newProductions, 
        unitPairs 
    };
};