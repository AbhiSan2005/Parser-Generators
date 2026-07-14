import express from "express";
import { generateRegex, generateCfg } from "../controllers/llmController.js";

const router = express.Router();

router.post("/ai/generate-regex", generateRegex);
router.post("/ai/generate-cfg", generateCfg);

export default router;