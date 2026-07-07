import { 
    RegexToEnfaService, 
    EnfaToNfaService, 
    NfaToDfaService, 
    EnfaToDfaService,
    MinimizeDfaServiceHopcrofts,
    DfaToRegexGnfaService
} from "./index.js";

export const AlgorithmRegistry = {

    // Automata Conversion
    'REGEX_TO_ENFA': (data) => RegexToEnfaService(data),
    'ENFA_TO_NFA': (data) => EnfaToNfaService(data),
    'NFA_TO_DFA': (data) => NfaToDfaService(data),
    'ENFA_TO_DFA': (data) => EnfaToDfaService(data),
    'DFA_TO_MINDFA_HOPCROFT': (data) => MinimizeDfaServiceHopcrofts(data),
    'REGEX_TO_NFA': (regexString) => {
        const enfa = RegexToEnfaService(regexString);
        return EnfaToNfaService(enfa);
    },
    'REGEX_TO_DFA': (regexString) => {
        const enfa = RegexToEnfaService(regexString);
        return EnfaToDfaService(enfa);
    },
    'REGEX_TO_MINDFA_HOPCROFT': (regexString) => {
        const enfa = RegexToEnfaService(regexString);
        const dfa = EnfaToDfaService(enfa);
        return MinimizeDfaServiceHopcrofts(dfa);
    },
    'NFA_TO_MINDFA_HOPCROFT': (nfaData) => {
        const dfa = NfaToDfaService(nfaData);
        return MinimizeDfaServiceHopcrofts(dfa);
    },
    'ENFA_TO_MINDFA_HOPCROFT': (enfaData) => {
        const dfa = EnfaToDfaService(enfaData);
        return MinimizeDfaServiceHopcrofts(dfa);
    },

    
    // Automata to Regex
    'DFA_TO_REGEX_GNFA': (data, options) => DfaToRegexGnfaService(data, options?.customOrder),
    'NFA_TO_REGEX_GNFA': (nfaData, options) => {
        const dfa = NfaToDfaService(nfaData);
        return DfaToRegexGnfaService(dfa, options?.customOrder);
    },
    'ENFA_TO_REGEX_GNFA': (enfaData, options) => {
        const dfa = EnfaToDfaService(enfaData);
        return DfaToRegexGnfaService(dfa, options?.customOrder);
    }
};