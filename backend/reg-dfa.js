import {TreeNode, createTree} from "./data-structures/tree.js";
import {isOperand, augment} from "./utils/helper.js";
import {traverse} from "./utils/algorithms.js";
import infixToPostfix from "./utils/infixToPostfix.js";
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Concat: |\nStar: *\nEnter regex: ", (input) => {
    input = augment(input)
    input = infixToPostfix(input)
    const [syntaxTree, nodes] = createTree(input)
    let followpos = new Array(nodes+1)
    for (let i = 0; i < nodes+1; i++) {
      followpos[i] = new Set();
    }
    traverse(syntaxTree, followpos)
    rl.close();
});