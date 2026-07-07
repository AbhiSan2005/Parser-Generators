import { dfa_to_regex_gnfa } from "../../utils/dfa_to_regex_gnfa.js";

export const DfaToRegexGnfaService = (dfaData, customOrder = null) => {
    const result = dfa_to_regex_gnfa(dfaData, customOrder);

    return {
        expression: result.regex, 
        derivation_steps: result.derivation_steps 
    };
};