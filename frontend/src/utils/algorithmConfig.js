export const ALGORITHM_CONFIG = {
    'REGEX_TO_ENFA': { label: 'Regex to ε-NFA', type: 'REGEX', target: 'ENFA' },
    'REGEX_TO_NFA': { label: 'Regex to NFA', type: 'REGEX', target: 'NFA' },
    'REGEX_TO_DFA': { label: 'Regex to DFA', type: 'REGEX', target: 'DFA' },
    'REGEX_TO_MINDFA_HOPCROFT': { label: 'Regex to Minimized DFA', type: 'REGEX', target: 'MIN_DFA' },
    'REGEX_TO_MINDFA_MYHILL_NERODE': { label: 'Regex to Minimized DFA (Myhill-Nerode)', type: 'REGEX', target: 'MIN_DFA' },
    'ENFA_TO_NFA': { label: 'ε-NFA to NFA', type: 'MACHINE', target: 'NFA' },
    'NFA_TO_DFA': { label: 'NFA to DFA', type: 'MACHINE', target: 'DFA' },
    'ENFA_TO_DFA': { label: 'ε-NFA to DFA', type: 'MACHINE', target: 'DFA' },
    'DFA_TO_MINDFA_HOPCROFT': { label: 'Minimize DFA (Hopcroft)', type: 'MACHINE', target: 'MIN_DFA' },
    'DFA_TO_MINDFA_MYHILL_NERODE': { label: 'Minimize DFA (Myhill-Nerode)', type: 'MACHINE', target: 'MIN_DFA' },
    'SIMPLIFY_CFG': { label: 'Simplify CFG', type: 'CFG', target: 'CFG' },
    'CFG_TO_CNF': { label: 'CFG to CNF', type: 'CFG', target: 'CNF' },
    'CYK_ALGORITHM': { label: 'CYK Algorithm', type: 'CFG_CYK', target: 'CYK' }
};