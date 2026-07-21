export const eliminateImmediateLeftRecursion = (variables, productions) => {
    let newVariables = [...variables];
    let newProductions = JSON.parse(JSON.stringify(productions));
    let changed = false;

    for (const A of variables) {
        const rules = newProductions[A] || [];
        const alphas = [];
        const betas = [];

        // Separate rules into those that start with A (left-recursive) and those that don't
        for (const rule of rules) {
            if (rule[0] === A) {
                alphas.push(rule.slice(1));
            } else {
                betas.push(rule);
            }
        }

        // If there is left recursion, mutate the rules
        if (alphas.length > 0) {
            changed = true;
            
            // Create a unique new variable (e.g., E becomes E_prime)
            let A_prime = `${A}_prime`;
            let counter = 1;
            while (newVariables.includes(A_prime)) {
                A_prime = `${A}_prime${counter++}`;
            }

            newVariables.push(A_prime);
            newProductions[A_prime] = [];
            newProductions[A] = [];

            // If there are no base cases (betas), fallback to epsilon
            if (betas.length === 0) {
                betas.push(['ε']); 
            }

            // A -> beta A'
            for (const beta of betas) {
                const newBeta = (beta.length === 1 && beta[0] === 'ε') ? [A_prime] : [...beta, A_prime];
                newProductions[A].push(newBeta);
            }

            // A' -> alpha A' | ε
            for (const alpha of alphas) {
                const newAlpha = (alpha.length === 0) ? [A_prime] : [...alpha, A_prime];
                newProductions[A_prime].push(newAlpha);
            }
            newProductions[A_prime].push(['ε']);
        }
    }
    return { variables: newVariables, productions: newProductions, changed };
};

export const leftFactor = (variables, productions) => {
    let newVariables = [...variables];
    let newProductions = JSON.parse(JSON.stringify(productions));
    let changed = false;

    const getCommonPrefix = (r1, r2) => {
        let i = 0;
        while (i < r1.length && i < r2.length && r1[i] === r2[i]) i++;
        return r1.slice(0, i);
    };

    let i = 0;
    while (i < newVariables.length) {
        const A = newVariables[i];
        let factored = false;

        const rules = newProductions[A] || [];
        
        for (let r1 = 0; r1 < rules.length; r1++) {
            for (let r2 = r1 + 1; r2 < rules.length; r2++) {
                const prefix = getCommonPrefix(rules[r1], rules[r2]);
                
                if (prefix.length > 0 && prefix[0] !== 'ε') {
                    factored = true;
                    changed = true;
                    
                    let A_prime = `${A}_factored`;
                    let counter = 1;
                    while (newVariables.includes(A_prime)) {
                        A_prime = `${A}_factored${counter++}`;
                    }
                    
                    newVariables.push(A_prime);
                    newProductions[A_prime] = [];

                    // Group all rules that share this prefix
                    const sharedRules = rules.filter(r => getCommonPrefix(prefix, r).length === prefix.length);
                    const otherRules = rules.filter(r => getCommonPrefix(prefix, r).length !== prefix.length);

                    // A' -> suffix
                    for (const r of sharedRules) {
                        const suffix = r.slice(prefix.length);
                        newProductions[A_prime].push(suffix.length === 0 ? ['ε'] : suffix);
                    }

                    // A -> prefix A' | otherRules
                    newProductions[A] = [...otherRules, [...prefix, A_prime]];
                    break; 
                }
            }
            if (factored) break; // Restart evaluation for this variable to catch cascading factors
        }
        
        if (!factored) i++;
    }

    return { variables: newVariables, productions: newProductions, changed };
};

export const preprocessLL1 = (variables, productions) => {
    // 1. Run Left Recursion Elimination
    let result = eliminateImmediateLeftRecursion(variables, productions);
    
    // 2. Run Left Factoring on the updated grammar
    result = leftFactor(result.variables, result.productions);
    
    return result;
};