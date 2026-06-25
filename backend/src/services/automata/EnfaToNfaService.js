import { enfa_to_nfa } from "../../utils/enfa_to_nfa.js";

export const EnfaToNfaService = (enfaData) => {
    const nfaData = enfa_to_nfa(enfaData);

    return {
        alphabet: nfaData.alphabet,
        states: nfaData.states,
        initial_states: nfaData.initial_states,
        final_states: nfaData.final_states,
        transitions: nfaData.transitions,
        adjacency_list: nfaData.adjacency_list
    };
};