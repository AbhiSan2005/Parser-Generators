export const simulateLL1 = (parsingTable, startVariable, tokens) => {
    const steps = [];
    const stack = ['$', startVariable];
    const parseRoot = { name: startVariable, children: [] };
    const treeStack = [{ symbol: '$', node: null }, { symbol: startVariable, node: parseRoot }];
    let cursor = 0;
    let success = false;

    // Helper to capture a frame for frontend animation
    const recordStep = (actionDescription, matchedToken = null) => {
        steps.push({
            stackSnapshot: [...stack],
            remainingInput: tokens.slice(cursor),
            actionTaken: actionDescription,
            matchedToken: matchedToken
        });
    };

    recordStep("Initialization: Stack contains start variable and end marker.");

    while (stack.length > 0) {
        const top = stack[stack.length - 1];
        const lookahead = tokens[cursor] || '$';

        // Base Case: Both stack and input are empty ($)
        if (top === '$' && lookahead === '$') {
            stack.pop();
            treeStack.pop();
            success = true;
            recordStep("Accept: Input successfully parsed.");
            break;
        }

        // Case 1: Stack top matches the lookahead terminal
        if (top === lookahead) {
            stack.pop();
            treeStack.pop();
            cursor++;
            recordStep(`Matched terminal '${top}'. Advancing input.`, top);
        } 
        
        // Case 2: Stack top is a variable, check the LL(1) matrix
        else if (parsingTable[top] && parsingTable[top][lookahead]) {
            const rule = parsingTable[top][lookahead];
            stack.pop();
            const parent = treeStack.pop().node;
            
            const ruleStr = rule.length === 1 && rule[0] === 'ε' ? 'ε' : rule.join(' ');
            recordStep(`Applied rule: ${top} -> ${ruleStr}. Popped ${top}.`);

            // Push the rule onto the stack in reverse order
            if (rule.length === 1 && rule[0] === 'ε') {
                parent.children.push({ name: 'ε', children: [] });
            } else {
                const childEntries = rule.map(symbol => ({
                    symbol,
                    node: { name: symbol, children: [] }
                }));
                parent.children.push(...childEntries.map(entry => entry.node));
                for (let i = childEntries.length - 1; i >= 0; i--) {
                    stack.push(childEntries[i].symbol);
                    treeStack.push(childEntries[i]);
                }
                recordStep(`Pushed [${rule.join(', ')}] reversed onto the stack.`);
            }
        } 
        
        // Case 3: Error, no valid rule exists
        else {
            recordStep(`Error: No valid transition for M[${top}, ${lookahead}]. Parsing halted.`);
            break;
        }
    }

    return {
        isAccepted: success,
        steps,
        abstract_syntax_tree: success ? parseRoot : null
    };
};