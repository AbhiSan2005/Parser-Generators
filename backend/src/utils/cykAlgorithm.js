export const buildCykTable = (variables, start_variable, productions, word) => {
    const n = word.length;
    
    // Handle edge case for empty string since we banned epsilon
    if (n === 0) {
        return { steps: [], finalTable: [], accepted: false };
    }

    // Initialize an empty upper-triangular table. 
    // table[row][col] -> row is (Length - 1), col is Start Index
    const table = Array.from({ length: n }, (_, row) =>
        Array.from({ length: n - row }, () => [])
    );

    const steps = [];

    // Helper to freeze a snapshot of the grid for the UI
    const getSnapshot = () => {
        const partitions = {};
        for (let i = 0; i < n; i++) {
            // Copy each cell so future mutations don't overwrite history
            partitions[`row_${i + 1}`] = table[i].map(cell => [...cell]);
        }
        return partitions;
    };

    // ==========================================
    // L = 1 (Initialization: Check for Terminals)
    // ==========================================
    for (let i = 0; i < n; i++) {
        const char = word[i];
        for (const head of variables) {
            if (!productions[head]) continue;
            for (const rule of productions[head]) {
                if (rule.length === 1 && rule[0] === char) {
                    if (!table[0][i].includes(head)) table[0][i].push(head);
                }
            }
        }
    }

    steps.push({
        step_description: `Initialization (L=1): Processing all substrings of length 1. Checked terminal rules for the characters: [ '${word.split('').join("', '")}' ].`,
        partitions: getSnapshot()
    });

    // ==========================================
    // L = 2 to n (Iteration: Check for Variables)
    // ==========================================
    for (let L = 2; L <= n; L++) {
        const row = L - 1;

        // Iterate through all possible starting positions for substring of length L
        for (let i = 0; i <= n - L; i++) {
            
            // Check all possible binary splits (k) of the substring
            for (let k = 1; k < L; k++) {
                const leftRow = k - 1;
                const leftCol = i;
                const rightRow = L - k - 1;
                const rightCol = i + k;

                const leftCell = table[leftRow][leftCol];
                const rightCell = table[rightRow][rightCol];

                // If both cells have variables, check their combinations
                if (leftCell.length > 0 && rightCell.length > 0) {
                    for (const B of leftCell) {
                        for (const C of rightCell) {
                            
                            // Look for a rule A -> BC
                            for (const head of variables) {
                                if (!productions[head]) continue;
                                for (const rule of productions[head]) {
                                    if (rule.length === 2 && rule[0] === B && rule[1] === C) {
                                        if (!table[row][i].includes(head)) {
                                            table[row][i].push(head);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        const isFinalStep = (L === n);
        const accepted = isFinalStep ? table[n - 1][0].includes(start_variable) : false;

        steps.push({
            step_description: isFinalStep 
                ? `Final Step (L=${L}): Evaluated the full string. The start variable '${start_variable}' was ${accepted ? 'found' : 'NOT found'} in the top cell. String is ${accepted ? 'ACCEPTED' : 'REJECTED'}.`
                : `Iteration (L=${L}): Processing substrings of length ${L}. Checked combinations of adjacent cells from lower rows.`,
            partitions: getSnapshot()
        });
    }

    return {
        steps,
        accepted: table[n - 1][0].includes(start_variable)
    };
};