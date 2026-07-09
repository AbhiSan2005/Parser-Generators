export const generate_recursive_descent_parser = (cfgData, parsingTable, followSets) => {
    const { start_symbol, non_terminals, terminals } = cfgData;
    const isTerminal = (sym) => terminals.includes(sym);

    let generatedCode = `
// ==========================================
// AUTO-GENERATED RECURSIVE DESCENT PARSER
// ==========================================

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.cursor = 0;
        this.errors = []; // <-- Track all syntax errors
    }

    get lookahead() {
        return this.tokens[this.cursor] || '$';
    }

    match(expected) {
        if (this.lookahead === expected) {
            const token = this.lookahead;
            this.cursor++;
            return { type: 'TERMINAL', value: token };
        }
        
        // Soft error handling instead of hard crash
        const errorMsg = \`Parse Error: Expected '\${expected}' but found '\${this.lookahead}' at position \${this.cursor}\`;
        this.errors.push(errorMsg);
        
        // Return an error node to keep the AST intact
        return { type: 'ERROR', message: errorMsg, expected, found: this.lookahead };
    }

    parse() {
        const ast = this.parse_${start_symbol}();
        if (this.lookahead !== '$') {
            this.errors.push(\`Parse Error: Unexpected trailing tokens starting with '\${this.lookahead}'\`);
        }
        return { ast, errors: this.errors }; // <-- Return both AST and Errors
    }
`;

    for (const nt of non_terminals) {
        generatedCode += `\n    parse_${nt}() {\n`;
        generatedCode += `        const node = { type: 'NON_TERMINAL', name: '${nt}', children: [] };\n`;
        generatedCode += `        switch(this.lookahead) {\n`;

        const row = parsingTable[nt] || {};
        const ruleMap = {};
        for (const [terminal, rule] of Object.entries(row)) {
            const ruleStr = JSON.stringify(rule);
            if (!ruleMap[ruleStr]) ruleMap[ruleStr] = [];
            ruleMap[ruleStr].push(terminal);
        }

        for (const [ruleStr, triggers] of Object.entries(ruleMap)) {
            const rule = JSON.parse(ruleStr);
            triggers.forEach(t => {
                generatedCode += `            case '${t}':\n`;
            });

            for (const symbol of rule) {
                if (symbol === 'ε') {
                    generatedCode += `                node.children.push({ type: 'EPSILON', value: 'ε' });\n`;
                } else if (isTerminal(symbol)) {
                    generatedCode += `                node.children.push(this.match('${symbol}'));\n`;
                } else {
                    generatedCode += `                node.children.push(this.parse_${symbol}());\n`;
                }
            }
            generatedCode += `                return node;\n`;
        }

        const syncTokens = followSets[nt] || [];
        generatedCode += `            default:\n`;
        generatedCode += `                const errorMsg = \`Parse Error: Unexpected token '\${this.lookahead}' while parsing ${nt}\`;\n`;
        generatedCode += `                this.errors.push(errorMsg);\n`;
        generatedCode += `                node.children.push({ type: 'ERROR', message: errorMsg });\n\n`;
        generatedCode += `                // Panic Mode: Skip tokens until a sync token (FOLLOW set) is found\n`;
        generatedCode += `                const syncTokens = ${JSON.stringify(syncTokens)};\n`;
        generatedCode += `                while (this.lookahead !== '$' && !syncTokens.includes(this.lookahead)) {\n`;
        generatedCode += `                    this.cursor++;\n`;
        generatedCode += `                }\n`;
        generatedCode += `                return node;\n`;
        generatedCode += `        }\n    }\n`;
    }

    generatedCode += `}\nreturn Parser;\n`;

    return generatedCode;
};