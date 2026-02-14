import { isOperand } from "./helper.js"

const infixToPostfix = (s) => {
    const prec = (s) => {
        if (s === '*') return 3
        else if (s === '.') return 2
        else if (s === '(') return 0
        else return 1
    }
    
    let st = []
    let r = ""
    for (let i = 0; i < s.length; i++) {
        if (isOperand(s[i])) {
            r += s[i]
        }
        else if (s[i] == '(') st.push('(')
        else if (s[i] == ')') {
            while (st[st.length-1] != '(') {
                r += st.pop();
            }
            st.pop();
        }
        else {
            while (st.length !== 0 && prec(s[i]) <= prec(st[st.length-1])) {
                r += st.pop()
            }
            st.push(s[i]);
        }
    }
    while (st.length !== 0) r += st.pop()
    return r
}

export default infixToPostfix;