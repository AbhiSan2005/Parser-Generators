import Enfa from "../models/Enfa.js"
import Regex from "../models/Regex.js"
import { regex_to_enfa } from "../utils/regex_to_enfa.js"
import { infix_to_postfix } from "../utils/infix_to_postfix.js"
import { extractAlphabet } from "../utils/extractAlphabet.js"
import {v4 as uuidv4} from "uuid"

export const getEnfaById = async (req, res) => {
    try {
        const {problem_id} = req.params;

        const enfa = await Enfa.findOne({problem_id: problem_id})
    
        if (enfa) {
            return res.json({
                success: true,
                data: enfa
            })
        }

        res.json({
            success: false,
            Error: `No Epsilon-Nfa was found for problem_id: ${problem_id}`
        })
    
    }
    catch (error) {
        res.json({
            success: false,
            Error: error
        })
    }
}

export const generateEnfaById = async (req, res) => {
    try {
        const {problem_id} = req.params;

        const existingEnfa = await Enfa.findOne({ problem_id });
        if (existingEnfa) {
            return res.json({
                success: true,
                data: existingEnfa, 
                message: "eNFA already exists"
            });
        }

        const regexData = await Regex.findOne({problem_id: problem_id});

        if(!regexData) {
            return res.json({
                success: false,
                Error: `No regex found for the given problem_id: ${problem_id}`
            })
        }

        const regex = regexData.regex

        const alphabets = extractAlphabet(regex);
        const postfix = infix_to_postfix(regex);
        const enfaData = regex_to_enfa(postfix);

        const newEnfa = new Enfa({
            username: regexData.username,
            user_id: regexData.user_id,
            problem_id: problem_id,
            regex: regex,
            alphabet: alphabets,
            states: enfaData.states,
            initial_states: enfaData.initial_states,
            final_states: enfaData.final_states,
            transitions: enfaData.transitions,
            adjacency_list: enfaData.adjacency_list,
            epsilon_closures: enfaData.epsilon_closures
        })

        const savedEnfa = await newEnfa.save();
        res.json({
            success: true,
            data: savedEnfa
        })
    }
    catch (error) {
        res.json({
            success: false,
            Error: error
        })
    }
}

export const generateEnfaByRegex = async (req, res) => {
    try {
        const {username, user_id, regex} = req.body

        const problem_id = uuidv4().substring(0, 8);

        const alphabets = extractAlphabet(regex);
        const postfix = infix_to_postfix(regex);
        const enfaData = regex_to_enfa(postfix);

        const newEnfa = new Enfa({
            username: username,
            user_id: user_id,
            problem_id: problem_id,
            regex: regex,
            alphabet: alphabets,
            states: enfaData.states,
            initial_states: enfaData.initial_states,
            final_states: enfaData.final_states,
            transitions: enfaData.transitions,
            adjacency_list: enfaData.adjacency_list,
            epsilon_closures: enfaData.epsilon_closures
        })

        const savedEnfa = await newEnfa.save();
        res.json({
            success: true,
            data: savedEnfa
        })
    }
    catch (error) {
        res.json({
            success: false,
            Error: error
        })
    }
}