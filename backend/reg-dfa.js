import {TreeNode, createTree} from "./data-structures/tree.js";
import {isOperand, augment} from "./utils/helper.js";
import infixToPostfix from "./utils/infixToPostfix.js";
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Concat: |\nStar: *\nEnter regex: ", (input) => {
    input = augment(input)
    input = infixToPostfix(input)
    const syntaxTree = createTree(input)
    rl.close();
});