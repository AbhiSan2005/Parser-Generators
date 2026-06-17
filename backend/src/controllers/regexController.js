import Regex from "../models/Regex.js";
import { generateRegexFromLLM } from "../services/regexGenerationLLM.js";

export const generateRegex = async (req, res) => {
    try {
        const {username, user_id, description} = req.body
    
        console.log("LLM Processing the Language: " + description);

        const regexJSON = await generateRegexFromLLM(description);

        const newRegex = new Regex({
            username: username,
            user_id: user_id,
            description: description,
            language_type: regexJSON.language_type,
            regex: regexJSON.regex
        })

        const savedRegex = await newRegex.save();

        res.json({
            success: true,
            data: savedRegex
        })
    }
    catch (error) {
        console.log(`Error: ${error}`);
        res.json({
            success: false,
            Error: error
        })
    }
};

export const getUserRegexes = async (req, res) => {
    try {
        const {user_id} = req.params;

        const regexes = await Regex.find({user_id: user_id});

        res.json({
            success: true,
            data: regexes
        })
    }
    catch (error) {
        console.log(`Error Fetching Regexes: ${error}`);
        res.json({
            success: false,
            Error: error
        })
    }
}

export const getRegexById = async (req, res) => {
    try {
        const {problem_id} = req.params;

        const regex = await Regex.findOne({problem_id: problem_id});

        res.json({
            success: true,
            data: regex
        })
    }
    catch (error) {
        console.log(`Error Fetching Regex: ${error}`);
        res.json({
            success: false,
            Error: error
        })
    }
}