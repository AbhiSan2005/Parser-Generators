import Nfa from "../models/Nfa.js";
import Enfa from "../models/Enfa.js";
import { enfa_to_nfa } from "../utils/enfa_to_nfa.js";

export const getNfaById = async (req, res) => {
    try {
        const { problem_id } = req.params;
        const nfaData = await Nfa.findOne({ problem_id });

        if (!nfaData) {
            return res.json({ success: false, Error: `No NFA found for problem_id ${problem_id}` });
        }
        res.json({ success: true, data: nfaData });
    } catch (error) {
        res.json({ success: false, Error: error.message });
    }
};

export const generateNfa = async (req, res) => {
    try {
        const { problem_id } = req.params;

        const existingNfa = await Nfa.findOne({ problem_id });
        if (existingNfa) {
            return res.json({ success: true, data: existingNfa, message: "NFA already exists" });
        }

        const enfaData = await Enfa.findOne({ problem_id });
        if (!enfaData) {
            return res.json({ success: false, Error: `Generate eNFA first for problem_id ${problem_id}` });
        }

        const nfaConverted = enfa_to_nfa(enfaData);

        const newNfa = new Nfa({
            username: enfaData.username,
            user_id: enfaData.user_id,
            problem_id: problem_id,
            alphabet: nfaConverted.alphabet,
            states: nfaConverted.states,
            initial_states: nfaConverted.initial_states,
            final_states: nfaConverted.final_states,
            transitions: nfaConverted.transitions,
            adjacency_list: nfaConverted.adjacency_list
        });

        const savedNfa = await newNfa.save();
        res.json({ success: true, data: savedNfa });
    } catch (error) {
        res.json({ success: false, Error: error.message });
    }
};