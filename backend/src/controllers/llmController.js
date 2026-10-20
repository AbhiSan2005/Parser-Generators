import { generateRegexFromLLM } from "../services/regexGenerationLLM.js";
import { generateCfgStringFromLLM } from "../services/cfgGenerationLLM.js";
import { parseCfgString } from "../utils/cfgParser.js";

export const generateRegex = async (req, res) => {
    try {
        const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
        if (!description) {
            return res.status(400).json({ success: false, Error: 'A language description is required.' });
        }

        const regexJSON = await generateRegexFromLLM(description);

        res.json({
            success: true,
            data: regexJSON
        });
    } catch (error) {
        console.error('Regex generation failed:', error.message);
        res.status(502).json({ success: false, Error: error.message });
    }
};

export const generateCfg = async (req, res) => {
    try {
        const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
        if (!description) {
            return res.status(400).json({ success: false, Error: 'A language description is required.' });
        }

        const rawCfgString = await generateCfgStringFromLLM(description);

        const completeCfg = parseCfgString(rawCfgString);
        if (!completeCfg.start_variable || Object.keys(completeCfg.productions).length === 0) {
            throw new Error('Gemini returned an invalid CFG. Please try a more specific description.');
        }

        res.json({
            success: true,
            data: completeCfg
        });
    } catch (error) {
        console.error('CFG generation failed:', error.message);
        res.status(502).json({ success: false, Error: error.message });
    }
};