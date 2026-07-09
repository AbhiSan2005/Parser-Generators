import { minimize_dfa } from "../../utils/minimize_dfa_Hopcrofts.js";

export const MinimizeDfaServiceHopcrofts = (dfaData) => {
    return minimize_dfa(dfaData);
};