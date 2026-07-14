// STEP 1: Handle Start Variable (No Epsilon Allowed)
export const handleStartVariable = (variables, start_variable, productions) => {
    let startOnRhs = false;

    // Check if start variable is on the right-hand side
    for (const head of variables) {
        if (!productions[head]) continue;
        for (const rule of productions[head]) {
            if (rule.includes(start_variable)) {
                startOnRhs = true;
                break;
            }
        }
    }

    // If start is on RHS, create a new start variable
    if (startOnRhs) {
        let newStart = "S0";
        let counter = 1;
        while (variables.includes(newStart)) {
            newStart = `S${counter++}`;
        }

        let newVariables = [newStart, ...variables];
        let newProductions = { ...productions };
        
        // Copy the rules from the original start variable to avoid creating a Unit Production (S0 -> S)
        const copiedRules = productions[start_variable].map(rule => [...rule]);
        newProductions[newStart] = [...copiedRules];

        return { newVariables, newStart, newProductions, changed: true };
    }

    return { newVariables: variables, newStart: start_variable, newProductions: productions, changed: false };
};

// STEP 2: Isolate Terminals (A -> aB becomes A -> T_a B)
export const isolateTerminals = (variables, terminals, productions) => {
    let newVars = [...variables];
    let newProds = JSON.parse(JSON.stringify(productions));
    let terminalMap = {}; 

    const getUniqueVar = (base) => {
        let v = base;
        let counter = 1;
        while (newVars.includes(v)) { v = `${base}_${counter++}`; }
        newVars.push(v);
        newProds[v] = [];
        return v;
    };

    for (const head of variables) { 
        if (!newProds[head]) continue;
        for (let i = 0; i < newProds[head].length; i++) {
            let rule = newProds[head][i];
            
            if (rule.length >= 2) {
                for (let j = 0; j < rule.length; j++) {
                    const sym = rule[j];
                    if (terminals.includes(sym)) {
                        if (!terminalMap[sym]) {
                            const tVar = getUniqueVar(`T_${sym}`);
                            terminalMap[sym] = tVar;
                            newProds[tVar].push([sym]);
                        }
                        rule[j] = terminalMap[sym];
                    }
                }
            }
        }
    }
    return { newVariables: newVars, newProductions: newProds, mappedTerminals: terminalMap };
};

// STEP 3: Binarize Long Rules (A -> BCD becomes A -> BV1, V1 -> CD)
export const binarizeRules = (variables, productions) => {
    let newVars = [...variables];
    let newProds = JSON.parse(JSON.stringify(productions));
    let createdVars = [];

    const getUniqueVar = () => {
        let v = `V`;
        let counter = 1;
        while (newVars.includes(v) || newVars.includes(`V_${counter}`)) { counter++; }
        v = `V_${counter}`;
        newVars.push(v);
        createdVars.push(v);
        newProds[v] = [];
        return v;
    };

    for (const head of variables) { 
        if (!newProds[head]) continue;
        let updatedRules = [];
        
        for (let i = 0; i < newProds[head].length; i++) {
            let rule = newProds[head][i];
            
            if (rule.length > 2) {
                let currentHead = head;
                let currentRule = [...rule];

                while (currentRule.length > 2) {
                    let first = currentRule[0];
                    let rest = currentRule.slice(1);
                    let newVar = getUniqueVar();

                    if (currentHead === head) updatedRules.push([first, newVar]);
                    else newProds[currentHead].push([first, newVar]);

                    currentHead = newVar;
                    currentRule = rest;
                }
                
                if (currentHead === head) updatedRules.push(currentRule);
                else newProds[currentHead].push(currentRule);
            } else {
                updatedRules.push(rule);
            }
        }
        newProds[head] = updatedRules;
    }
    return { newVariables: newVars, newProductions: newProds, addedVars: createdVars };
};