const isOperand = (s) => {
    return s !== '|' && s !== '*' && s !== ')' && s !== '(' && s !== '.'
}

const augment = (s) => {
    //Add . in between characters (needed for tree)
    s = "(" + s + ")#"     
    const n = s.length
    let r = ""
    for (let i = 0; i < n; i++) {
        let prevCanEnd = false, currCanStart = false;
        if (i > 0 && (isOperand(s[i-1]) || s[i-1] === '*' || s[i-1] === ')')) {
            prevCanEnd = true
        }
        if (isOperand(s[i]) || s[i] === '(') {
            currCanStart = true
        }
        if (prevCanEnd && currCanStart) r += '.'
        r += s[i]
    }
    return r
}

export {augment, isOperand};