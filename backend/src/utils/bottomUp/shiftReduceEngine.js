/**
 * Simulates a standard Bottom-Up Shift-Reduce parser.
 * It uses the generated ACTION and GOTO tables to process an array of tokens
 * and builds a nested Abstract Syntax Tree (AST) for the frontend canvas.
 */
export const simulateShiftReduceParsing = (tokens, actionTable, gotoTable, indexedRules) => {
    // The stack tracks our state history
    const stateStack = [0];
    
    // The symbol stack tracks our tree nodes as we build them from the bottom up
    const symbolStack = [];
    
    let cursor = 0;
    const steps = []; // Optional: tracks the exact history of the stack for a UI debugger panel

    while (cursor < tokens.length) {
        const currentState = stateStack[stateStack.length - 1];
        const lookahead = tokens[cursor];
        const action = actionTable[currentState][lookahead];

        // Log the step for UI debugging
        steps.push({
            stack: [...stateStack],
            symbols: symbolStack.map(node => node.name).join(' '),
            lookahead,
            action: action || "ERROR"
        });

        // 1. Error Handling (No action found in the matrix cell)
        if (!action) {
            return {
                status: 'REJECTED',
                error_message: `Syntax Error: Unexpected token '${lookahead}' at state ${currentState}.`,
                abstract_syntax_tree: null,
                steps
            };
        }

        // 2. Accept Handling (Successful Parse)
        if (action === 'acc') {
            return {
                status: 'ACCEPTED',
                error_message: null,
                // The final tree is sitting at the bottom of the symbol stack
                abstract_syntax_tree: symbolStack[0],
                steps
            };
        } 
        
        // 3. Shift Handling (sX)
        if (action.startsWith('s')) {
            const nextState = parseInt(action.substring(1), 10);
            
            // Push state and the new leaf node
            stateStack.push(nextState);
            symbolStack.push({ name: lookahead, children: [] });
            
            cursor++;
        } 
        
        // 4. Reduce Handling (rX)
        else if (action.startsWith('r')) {
            const ruleIdx = parseInt(action.substring(1), 10);
            const ruleObj = indexedRules[ruleIdx];
            
            // Epsilon rules pop 0 things off the stack. Otherwise, pop RHS length.
            const popCount = ruleObj.rule[0] === 'ε' ? 0 : ruleObj.rule.length;
            
            const children = [];
            for (let i = 0; i < popCount; i++) {
                stateStack.pop();
                // unshift so the children stay in the correct left-to-right order
                children.unshift(symbolStack.pop());
            }

            const exposedState = stateStack[stateStack.length - 1];
            const gotoState = gotoTable[exposedState][ruleObj.variable];

            if (gotoState === undefined) {
                return {
                    status: 'REJECTED',
                    error_message: `GOTO Error: Missing transition for '${ruleObj.variable}' at state ${exposedState}.`,
                    abstract_syntax_tree: null,
                    steps
                };
            }

            stateStack.push(gotoState);
            symbolStack.push({ name: ruleObj.variable, children });
        }
    }

    // Failsafe in case the loop exits abruptly
    return {
        status: 'REJECTED',
        error_message: 'Unexpected end of input stream.',
        abstract_syntax_tree: null,
        steps
    };
};