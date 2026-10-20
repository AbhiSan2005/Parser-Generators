const regexExamples = [
    { id: 'ends-a', label: 'Strings ending in a', input: '(a+b)*.a', testString: 'ba' },
    { id: 'one-or-more-a', label: 'One or more a symbols', input: 'a.a*', testString: 'aaa' }
];

const regexActions = [
    'REGEX_TO_ENFA',
    'REGEX_TO_NFA',
    'REGEX_TO_DFA',
    'REGEX_TO_MINDFA_HOPCROFT',
    'REGEX_TO_MINDFA_MYHILL_NERODE'
];

const epsilonNfaPresets = [
    {
        id: 'epsilon-a',
        label: 'Epsilon then a',
        machineType: 'ENFA',
        testString: 'a',
        machineData: {
            alphabet: ['a'],
            states: ['q0', 'q1', 'q2'],
            initial_states: ['q0'],
            final_states: ['q2'],
            transitions: [
                { from: 'q0', to: 'q1', symbol: 'ε' },
                { from: 'q1', to: 'q2', symbol: 'a' }
            ],
            adjacency_list: { q0: { 'ε': ['q1'] }, q1: { a: ['q2'] }, q2: {} },
            epsilon_closures: { q0: ['q0', 'q1'], q1: ['q1'], q2: ['q2'] }
        }
    },
    {
        id: 'b-with-epsilon-finish',
        label: 'b then epsilon to accept',
        machineType: 'ENFA',
        testString: 'b',
        machineData: {
            alphabet: ['b'],
            states: ['q0', 'q1', 'q2'],
            initial_states: ['q0'],
            final_states: ['q2'],
            transitions: [
                { from: 'q0', to: 'q1', symbol: 'b' },
                { from: 'q1', to: 'q2', symbol: 'ε' }
            ],
            adjacency_list: { q0: { b: ['q1'] }, q1: { 'ε': ['q2'] }, q2: {} },
            epsilon_closures: { q0: ['q0'], q1: ['q1', 'q2'], q2: ['q2'] }
        }
    }
];

const nfaPresets = [
    {
        id: 'two-a-path',
        label: 'Two a symbols',
        machineType: 'NFA',
        testString: 'aa',
        machineData: {
            alphabet: ['a'],
            states: ['q0', 'q1', 'q2'],
            initial_states: ['q0'],
            final_states: ['q2'],
            transitions: [
                { from: 'q0', to: 'q1', symbol: 'a' },
                { from: 'q1', to: 'q2', symbol: 'a' }
            ],
            adjacency_list: { q0: { a: ['q1'] }, q1: { a: ['q2'] }, q2: {} }
        }
    },
    {
        id: 'contains-ab',
        label: 'Contains ab',
        machineType: 'NFA',
        testString: 'aab',
        machineData: {
            alphabet: ['a', 'b'],
            states: ['q0', 'q1', 'q2'],
            initial_states: ['q0'],
            final_states: ['q2'],
            transitions: [
                { from: 'q0', to: 'q0', symbol: 'a' },
                { from: 'q0', to: 'q1', symbol: 'a' },
                { from: 'q0', to: 'q0', symbol: 'b' },
                { from: 'q1', to: 'q2', symbol: 'b' },
                { from: 'q2', to: 'q2', symbol: 'a' },
                { from: 'q2', to: 'q2', symbol: 'b' }
            ],
            adjacency_list: { q0: { a: ['q0', 'q1'], b: ['q0'] }, q1: { b: ['q2'] }, q2: { a: ['q2'], b: ['q2'] } }
        }
    }
];

const dfaPresets = [
    {
        id: 'ends-a-dfa',
        label: 'DFA: ends in a',
        machineType: 'DFA',
        testString: 'ba',
        machineData: {
            alphabet: ['a', 'b'],
            states: ['q0', 'q1'],
            initial_states: ['q0'],
            final_states: ['q1'],
            transitions: [
                { from: 'q0', to: 'q1', symbol: 'a' }, { from: 'q0', to: 'q0', symbol: 'b' },
                { from: 'q1', to: 'q1', symbol: 'a' }, { from: 'q1', to: 'q0', symbol: 'b' }
            ],
            adjacency_list: { q0: { a: ['q1'], b: ['q0'] }, q1: { a: ['q1'], b: ['q0'] } }
        }
    },
    {
        id: 'ends-b-dfa',
        label: 'DFA: ends in b',
        machineType: 'DFA',
        testString: 'ab',
        machineData: {
            alphabet: ['a', 'b'],
            states: ['q0', 'q1'],
            initial_states: ['q0'],
            final_states: ['q1'],
            transitions: [
                { from: 'q0', to: 'q0', symbol: 'a' }, { from: 'q0', to: 'q1', symbol: 'b' },
                { from: 'q1', to: 'q0', symbol: 'a' }, { from: 'q1', to: 'q1', symbol: 'b' }
            ],
            adjacency_list: { q0: { a: ['q0'], b: ['q1'] }, q1: { a: ['q0'], b: ['q1'] } }
        }
    }
];

const cfgExamples = [
    { id: 'anbn-textbook', label: 'Textbook: equal a’s then b’s', input: 'S -> a S b | a b', testString: 'aabb' },
    { id: 'short-cfg-textbook', label: 'Textbook: ab or bc', input: 'S -> A B | B C\nA -> a\nB -> b\nC -> c', testString: 'bc' }
];

const cnfExamples = [
    { id: 'cnf-ab-bc', label: 'Textbook: ab or bc', input: 'S -> A B | B C\nA -> a\nB -> b\nC -> c', testString: 'ab' },
    { id: 'cnf-abc', label: 'Textbook: derive abc', input: 'S -> A B\nA -> a\nB -> C D\nC -> b\nD -> c', testString: 'abc' }
];

export const WORKSPACE_PRESETS = [
    ...regexActions.flatMap(actionType => regexExamples.map(example => ({
        ...example,
        id: `${actionType.toLowerCase()}-${example.id}`,
        label: example.label,
        actionType,
        kind: 'REGEX'
    }))),
    ...['ENFA_TO_NFA', 'ENFA_TO_DFA'].flatMap(actionType => epsilonNfaPresets.map(example => ({
        ...example,
        id: `${actionType.toLowerCase()}-${example.id}`,
        actionType,
        kind: 'MACHINE'
    }))),
    ...nfaPresets.map(example => ({ ...example, id: `nfa-to-dfa-${example.id}`, actionType: 'NFA_TO_DFA', kind: 'MACHINE' })),
    ...['DFA_TO_MINDFA_HOPCROFT', 'DFA_TO_MINDFA_MYHILL_NERODE'].flatMap(actionType => dfaPresets.map(example => ({
        ...example,
        id: `${actionType.toLowerCase()}-${example.id}`,
        actionType,
        kind: 'MACHINE'
    }))),
    ...cfgExamples.map(example => ({ ...example, id: `simplify-${example.id}`, actionType: 'SIMPLIFY_CFG', kind: 'CFG' })),
    ...cnfExamples.map(example => ({ ...example, id: `cnf-${example.id}`, actionType: 'CFG_TO_CNF', kind: 'CFG' })),
    ...cnfExamples.map(example => ({ ...example, id: `cyk-${example.id}`, actionType: 'CYK_ALGORITHM', kind: 'CFG' }))
];

export const PLAYGROUND_PRESETS = [
    {
        id: 'll1-arithmetic-textbook',
        label: 'LL(1): textbook expression precedence',
        parserType: 'LL1',
        value: "E -> T E'\nE' -> + T E' | epsilon\nT -> F T'\nT' -> * F T' | epsilon\nF -> ( E ) | id",
        testString: 'id + id * id'
    },
    {
        id: 'll1-statement-program',
        label: 'LL(1): programming-style if statement',
        parserType: 'LL1',
        value: 'Program -> if ( id ) return number ;',
        testString: 'if ( id ) return number ;'
    },
    {
        id: 'lr0-cc-textbook',
        label: 'LR(0): textbook S → CC grammar',
        parserType: 'LR0',
        value: 'S -> C C\nC -> c C | d',
        testString: 'cdd'
    },
    {
        id: 'lr0-statement-program',
        label: 'LR(0): programming-style return statement',
        parserType: 'LR0',
        value: 'Program -> return id + number ;',
        testString: 'return id + number ;'
    },
    {
        id: 'slr1-expression-textbook',
        label: 'SLR(1): textbook arithmetic expressions',
        parserType: 'SLR1',
        value: 'E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id',
        testString: 'id + id * id'
    },
    {
        id: 'slr1-assignment-program',
        label: 'SLR(1): programming-style conditional',
        parserType: 'SLR1',
        value: 'Statement -> if ( Expression ) return id ;\nExpression -> Expression + Term | Term\nTerm -> id | number',
        testString: 'if ( id + number ) return id ;'
    }
];

export const formatGrammar = (grammar) => {
    if (typeof grammar === 'string') return grammar;
    if (!grammar?.productions) return '';

    return Object.entries(grammar.productions)
        .map(([variable, rules]) => {
            const alternatives = rules.map(rule => Array.isArray(rule) ? rule.join(' ') : String(rule));
            return `${variable} -> ${alternatives.join(' | ')}`;
        })
        .join('\n');
};