const precedence = (ch) => {
    if(ch == '*')
        return 3;
    if(ch == '.')
        return 2;
    if(ch == '+')
        return 1;
    return 0;
}

export const infix_to_postfix = (infix) => {
    let postfix = "";
    const stack = [];

    for (const ch of infix) {

        if(/[a-zA-Z0-9]/.test(ch)) {
            postfix += ch;
        }
        else if(ch === '(') {
            stack.push(ch);
        }
        else if(ch === ")") {
            while(stack.length > 0 && stack[stack.length - 1] !== '(') {
                postfix += stack.pop();
            }
            stack.pop();
        }
        else {
            while(stack.length > 0 && precedence(ch) <= precedence(stack[stack.length - 1])) {
                postfix += stack.pop();
            }
            stack.push(ch);
        }
    }

    while(stack.length > 0) {
        postfix += stack.pop();
    }

    return postfix;
}

// console.log(infix_to_postfix("a.(a+b)*.b"))