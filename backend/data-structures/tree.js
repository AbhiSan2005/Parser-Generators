import {isOperand} from '../utils/helper.js';

class TreeNode {
    constructor(value, left = null, right = null, isNullable = false, firstpos = null, lastpos = null, position = -1) {
        this.symbol = value;
        this.type = (this.symbol === '|' || this.symbol === '.' || this.symbol === '*') ? "Operator" : "Input";
        this.left = left;
        this.right = right;
        this.nullable = isNullable;
        this.firstpos = firstpos === null ? new Set() : firstpos;
        this.lastpos = lastpos === null ? new Set() : lastpos;
        this.position = position;
    }

    isLeaf() {
        return this.left === null && this.right === null;
    }
}

const createTree = (exp) => {
    let st = []
    let posCnt = 1;
    for (let i = 0; i < exp.length; i++) {
        if (isOperand(exp[i])) {
            st.push(new TreeNode(exp[i], null, null, false, null, null, posCnt++))
        }
        else {
            if (exp[i] === '*') {
                const operandA = st.pop()
                st.push(new TreeNode(exp[i], operandA))
            }
            else {
                const operandA = st.pop()
                const operandB = st.pop()
                st.push(new TreeNode(exp[i], operandB, operandA))
            }
        }
    }
    return [st.pop(), posCnt]
}

export {TreeNode, createTree};