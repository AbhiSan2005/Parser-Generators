export const parseCfgString = (cfgString, specifiedStartVar = null) => {
    
    const productions = {};
    const lines = cfgString.split('\n');
    let firstVar = null;

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const parts = line.split(/(?:->|=>|=)/);
        if (parts.length < 2) continue;

        const head = parts[0].trim();
        if (!firstVar) firstVar = head;

        if (!productions[head]) productions[head] = [];

        const rhsString = parts.slice(1).join("->");
        const alternatives = rhsString.split('|');

        for (let alt of alternatives) {
            alt = alt.trim();
            if (!alt) continue;

            const tokens = alt.split(/\s+/).map(token => {
                if (token.toLowerCase() === 'epsilon' || token === 'e') return 'ε';
                return token;
            });

            productions[head].push(tokens);
        }
    }

    const variables = Object.keys(productions);
    const start_variable = specifiedStartVar || (variables.includes('S') ? 'S' : firstVar);

    const terminals = new Set();
    for (const head of variables) {
        for (const rule of productions[head]) {
            for (const symbol of rule) {
                if (!variables.includes(symbol) && symbol !== 'ε') {
                    terminals.add(symbol);
                }
            }
        }
    }

    return {
        variables,
        terminals: [...terminals].sort(),
        start_variable,
        productions
    };
};