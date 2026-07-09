export const END_MARKER = '$';

export const tokenize = (inputString, terminals) => {
    let cursor = 0;
    const tokens = [];
    
    const sortedTerminals = [...terminals].sort((a, b) => b.length - a.length);

    while (cursor < inputString.length) {
        const char = inputString[cursor];
        if (/\s/.test(char)) {
            cursor++;
            continue;
        }

        let matched = false;

        for (const terminal of sortedTerminals) {
            if (inputString.startsWith(terminal, cursor)) {
                tokens.push(terminal);
                cursor += terminal.length;
                matched = true;
                break;
            }
        }

        if (!matched) {
            throw new Error(`Lexical Error: Unrecognized character '${char}' at position ${cursor}`);
        }
    }

    tokens.push(END_MARKER);    
    return tokens;
};