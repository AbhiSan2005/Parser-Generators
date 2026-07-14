import { generateRegexFromLLM } from "../services/regexGenerationLLM.js";
import { generateCfgStringFromLLM } from "../services/cfgGenerationLLM.js";
import { parseCfgString } from "../utils/cfgParser.js";

export const generateRegex = async (req, res) => {
    try {
        const { description } = req.body;
        
        console.log("LLM Processing the Language: " + description);

        const regexJSON = await generateRegexFromLLM(description);

        res.json({
            success: true,
            data: regexJSON
        });
    } catch (error) {
        console.log(`AI Helper Error: ${error}`);
        res.json({ success: false, Error: error.message });
    }
};

export const generateCfg = async (req, res) => {
    try {
        const { description } = req.body;
        
        console.log("LLM Processing CFG for: " + description);

        const rawCfgString = await generateCfgStringFromLLM(description);

        const completeCfg = parseCfgString(rawCfgString);

        res.json({
            success: true,
            data: completeCfg
        });
    } catch (error) {
        console.log(`CFG AI Helper Error: ${error}`);
        res.json({ success: false, Error: error.message });
    }
};