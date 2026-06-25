import { generateRegexFromLLM } from "../services/regexGenerationLLM.js";

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