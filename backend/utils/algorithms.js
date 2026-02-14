const isNullable = (node) => {
    if (node.symbol === 'ε') return true
    if (node.isLeaf()) return false
    if (node.symbol === '|') return isNullable(node.left) || isNullable(node.right)
    if (node.symbol === '.') return isNullable(node.left) && isNullable(node.right)
    if (node.symbol === '*') return true
}

const firstpos = (node) => {
    if (node.symbol === 'ε') return new Set()
    if (node.isLeaf()) return new Set([node.position])
    if (node.symbol === '|') return firstpos(node.left).union(firstpos(node.right))
    if (node.symbol === '.') return (isNullable(node.left)) ? firstpos(node.left).union(firstpos(node.right)) : firstpos(node.left)
    if (node.symbol === '*') return firstpos(node.left)
}

const lastpos = (node) => {
    if (node.symbol === 'ε') return new Set()
    if (node.isLeaf()) return new Set([node.position])
    if (node.symbol === '|') return lastpos(node.left).union(lastpos(node.right))
    if (node.symbol === '.') return (isNullable(node.right)) ? lastpos(node.left).union(lastpos(node.right)) : lastpos(node.right)
    if (node.symbol === '*') return lastpos(node.left)
}

const followpos = (node, arr) => {
    if (node.symbol === '.') {
        for (const i of lastpos(node.left)) {
            for (const j of firstpos(node.right)) {
                arr[i].add(j)
            }
        }
    }
    if (node.symbol === '*') {
        for (const i of lastpos(node)) {
            for (const j of firstpos(node)) {
                arr[i].add(j)
            }
        }
    }
}

const traverse = (root, arr) => {
    if (root === null) return
    traverse(root.left, arr)
    traverse(root.right, arr)
    followpos(root, arr)
}

export {firstpos, traverse};