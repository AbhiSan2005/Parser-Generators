import { extractAlphabet } from "../../utils/extractAlphabet.js";
import { infix_to_postfix } from "../../utils/infix_to_postfix.js";
import { regex_to_enfa } from "../../utils/regex_to_enfa.js";

export const RegexToEnfaService = (regexString) => {
    const alphabets = extractAlphabet(regexString);
    const postfix = infix_to_postfix(regexString);
    const enfaData = regex_to_enfa(postfix);

    return {
        regex: regexString,
        alphabet: alphabets,
        states: enfaData.states,
        initial_states: enfaData.initial_states,
        final_states: enfaData.final_states,
        transitions: enfaData.transitions,
        adjacency_list: enfaData.adjacency_list,
        epsilon_closures: enfaData.epsilon_closures
    };
};