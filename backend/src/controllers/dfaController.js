import Dfa from "../models/Dfa.js";
import Enfa from "../models/Enfa.js"
import Nfa from "../models/Nfa.js";
import { enfa_to_dfa } from "../utils/enfa_to_dfa.js";
import { nfa_to_dfa } from "../utils/nfa_to_dfa.js";

export const getDfaById = async (req, res) => {
    try {
        const {problem_id} = req.params;

        const dfaData = await Dfa.findOne({problem_id: problem_id});

        if(!dfaData) {
            return res.json({
                success: false,
                Error: `No Dfa found for the problem_id ${problem_id}`
            })
        }

        res.json({
            success: true,
            data: dfaData
        })
    }
    catch (error) {
        res.json({
            success: false,
            Error: error
        })
    }
}

export const generateDfa = async (req, res) => {
    try {
        const { problem_id } = req.params;

        const existingDfa = await Dfa.findOne({ problem_id });
        if (existingDfa) {
            return res.json({ success: true, data: existingDfa, message: "DFA already exists" });
        }

        let dfaData;
        
        // Strategy: Check if clean NFA exists first
        const nfaData = await Nfa.findOne({ problem_id });
        if (nfaData) {
            dfaData = nfa_to_dfa(nfaData);
        } else {
            // Fallback: Check if eNFA exists
            const enfaData = await Enfa.findOne({ problem_id });
            if (!enfaData) {
                return res.json({ success: false, Error: "No NFA or eNFA found. Please process earlier pipeline steps first." });
            }
            dfaData = enfa_to_dfa(enfaData);
        }

        const newDfa = new Dfa({
            username: nfaData ? nfaData.username : enfaData.username,
            user_id: nfaData ? nfaData.user_id : enfaData.user_id,
            problem_id: problem_id,
            alphabet: dfaData.alphabet,
            states: dfaData.states,
            initial_states: dfaData.initial_states,
            final_states: dfaData.final_states,
            transitions: dfaData.transitions,
            adjacency_list: dfaData.adjacency_list,
            state_mapping: dfaData.state_mapping
        });

        const savedDfa = await newDfa.save();
        res.json({ success: true, data: savedDfa });
    } catch (error) {
        res.json({ success: false, Error: error.message });
    }
}