import {TreeNode, createTree} from "./data-structures/tree.js";
import {isOperand, augment} from "./utils/helper.js";
import {firstpos, traverse} from "./utils/algorithms.js";
import {eqSet} from "./utils/setFunctions.js";
import infixToPostfix from "./utils/infixToPostfix.js";
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Concat: |\nStar: *\nEnter regex: ", (input) => {
    //Validate?  
    let symbols = new Set()
    for (const ch of input) if (isOperand(ch)) symbols.add(ch)
    input = augment(input)
    input = infixToPostfix(input)
    let positionStateMap = new Map()
    const [syntaxTree, nodes] = createTree(input, positionStateMap)

    let followpos = new Array(nodes+1)
    for (let i = 0; i < nodes+1; i++) {
      followpos[i] = new Set();
    }
    traverse(syntaxTree, followpos)

    const startState = firstpos(syntaxTree)
    let states = [startState], queue = [startState]
    let dtran = []
    dtran.push({})

    while (queue.length !== 0) {
      let currState = queue.shift()
      let currStateIndex = states.findIndex(state => state === currState)
      for (const ch of symbols) {
        let nextState = new Set()
        for (const pos of currState) {
          if (positionStateMap.get(pos) === ch) followpos[pos].forEach(item => nextState.add(item))
        }
        if (nextState.size === 0) continue
        let unique = true;
        let nextStateIndex = 0
        for (const set of states) {
          if (eqSet(set, nextState)) {
            unique = false
            break;
          }
          nextStateIndex++;
        }
        if (unique) {
          states.push(nextState)
          queue.push(nextState)
          dtran.push({})
          dtran[currStateIndex][ch] = states.length-1
        }
        else {
          dtran[currStateIndex][ch] = nextStateIndex
        }
      }
    }

    let finalStates = []
    for (let i = 0; i < states.length; i++) {
      if (states[i].has(nodes)) {
        finalStates.push(i)
      }
    }

    console.table("Transition Table:\n" + dtran)
    console.log("Start States:" + startState)
    console.log("Accepting States:" + finalStates)
    rl.close();
});