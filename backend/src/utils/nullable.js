export const EPSILON = 'ε';

export const computeNullable = (variables, productions) => {
    const nullable = new Set();
    let changed = true;

    while (changed) {
        changed = false;
        
        for (const variable of variables) {
            if (nullable.has(variable)) continue;

            const rules = productions[variable] || [];
            
            for (const rule of rules) {
                if (rule.length === 1 && rule[0] === EPSILON) {
                    nullable.add(variable);
                    changed = true;
                    break;
                }

                const allNullable = rule.every(symbol => nullable.has(symbol));
                if (rule.length > 0 && allNullable) {
                    nullable.add(variable);
                    changed = true;
                    break;
                }
            }
        }
    }
    
    return nullable;
};