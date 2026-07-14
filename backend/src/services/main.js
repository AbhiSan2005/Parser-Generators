import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CfgToCnfService } from './cfgToCnfService.js';
import { CykService } from './cykService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The raw Palindrome Grammar
const palindromeGrammar = {
    variables: ["P"],
    terminals: ["0", "1"],
    start_variable: "P",
    productions: {
        "P": [
            ["0", "P", "0"],
            ["1", "P", "1"],
            ["0"],
            ["1"],
            ["ε"]
        ]
    },
    derivation_steps: []
};

// The test string (A valid even-length palindrome)
const testWord = "1110111";

const runTest = () => {
    console.log("Starting End-to-End CYK Pipeline Test...");

    try {
        // Step 1: Convert the raw grammar to Chomsky Normal Form
        console.log("1. Generating CNF Grammar...");
        const cnfGrammar = CfgToCnfService(palindromeGrammar);

        // Step 2: Run the CYK Algorithm to test the word
        console.log(`2. Running CYK Algorithm for word: "${testWord}"...`);
        const result = CykService(cnfGrammar, testWord);

        // Step 3: Save the result for frontend verification
        const outputPath = path.join(__dirname, 'cyk_result.json');
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

        console.log(`\n✅ Success! CYK Matrix saved to: ${outputPath}`);
        console.log(`--- Result Summary ---`);
        console.log(`Word: ${result.word}`);
        console.log(`Accepted: ${result.accepted ? '🟢 YES' : '🔴 NO'}`);
        console.log(`Matrix Size: ${result.table_size}x${result.table_size}`);
        
    } catch (error) {
        console.error("❌ Pipeline crashed:", error.message);
    }
};

runTest();