import { minimize_dfa } from "../../utils/minimize_dfa_Hopcrofts";

export const MinimizeDfaServiceHopcrofts = (dfaData) => {
    return minimize_dfa(dfaData);
};