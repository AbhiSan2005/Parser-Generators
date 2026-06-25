import { 
    RegexToEnfaService, 
    EnfaToNfaService, 
    NfaToDfaService, 
    EnfaToDfaService 
} from "./index.js";

export const AlgorithmRegistry = {
    // Single Step Algos
    'REGEX_TO_ENFA': (data) => RegexToEnfaService(data),
    'ENFA_TO_NFA': (data) => EnfaToNfaService(data),
    'NFA_TO_DFA': (data) => NfaToDfaService(data),
    'ENFA_TO_DFA': (data) => EnfaToDfaService(data),

    // Multi Step Algos
    'REGEX_TO_NFA': (regexString) => {
        const enfa = RegexToEnfaService(regexString);
        return EnfaToNfaService(enfa);
    },
    'REGEX_TO_DFA': (regexString) => {
        const enfa = RegexToEnfaService(regexString);
        return EnfaToDfaService(enfa);
    },
};