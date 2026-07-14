import { analyzeCFG } from '../services/cfg/cfgService.js';

export const processCFG = async (req, res) => {
    try {
        const cfgData = req.body.cfg_data;
        
        if (!cfgData) {
            return res.status(400).json({ error: "Missing cfg_data in request body" });
        }

        const result = analyzeCFG(cfgData);

        return res.status(200).json({
            success: true,
            message: "CFG analyzed successfully",
            data: result
        });
    } catch (error) {
        console.error("CFG Processing Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error during CFG processing"
        });
    }
};