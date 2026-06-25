import { nfa_to_dfa } from "../../utils/nfa_to_dfa.js";

export const NfaToDfaService = (nfaData) => {
    const dfaData = nfa_to_dfa(nfaData);

    return {
        alphabet: dfaData.alphabet,
        states: dfaData.states,
        initial_states: dfaData.initial_states,
        final_states: dfaData.final_states,
        transitions: dfaData.transitions,
        adjacency_list: dfaData.adjacency_list,
        state_mapping: dfaData.state_mapping
    };
};