import { enfa_to_dfa } from "../../utils/enfa_to_dfa.js";

export const EnfaToDfaService = (enfaData) => {
    const dfaData = enfa_to_dfa(enfaData);

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