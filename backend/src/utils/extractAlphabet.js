export const extractAlphabet = (regex) => {
    const alphabets = regex.match(/[a-zA-Z0-9]/g)

    let s = new Set();

    for (const ch of alphabets) {
        s.add(ch)
    }

    return [...s].sort()
}

// console.log(extractAlphabet("a.(a+b)*"))