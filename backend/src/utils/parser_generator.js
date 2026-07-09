export const generate_recursive_descent_parser = (cfgData, parsingTable) => {
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
    }

    get lookahead() {
        // Return the current token, or '$' if we've reached the end
        return this.tokens[this.cursor] || '$';
    }

    match(expected) {
        if (this.lookahead === expected) {
            const token = this.lookahead;
            this.cursor++;
            return { type: 'TERMINAL', value: token };
        }
        throw new Error(\`Parse Error: Expected '\${expected}' but found '\${this.lookahead}' at position \${this.cursor}\`);
    }

    parse() {
        const ast = this.parse_${start_symbol}();
        if (this.lookahead !== '$') {
            throw new Error(\`Parse Error: Unexpected trailing tokens starting with '\${this.lookahead}'\`);
        }
        return ast;
    }
`;

    //Generate a method for each Non-Terminal based on the LL(1) Table
    for (const nt of non_terminals) {
        generatedCode += `\n    parse_${nt}() {\n`;
        generatedCode += `        const node = { type: 'NON_TERMINAL', name: '${nt}', children: [] };\n`;
        generatedCode += `        switch(this.lookahead) {\n`;

        const row = parsingTable[nt] || {};

        // Group terminals that trigger the exact same rule to avoid switch-case redundancy
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

        generatedCode += `            default:\n`;
        generatedCode += `                throw new Error(\`Parse Error: Unexpected token '\${this.lookahead}' while parsing ${nt}\`);\n`;
        generatedCode += `        }\n`;
        generatedCode += `    }\n`;
    }

    generatedCode += `}\n\n`;
    generatedCode += `export default Parser;\n`;

    return generatedCode;
};