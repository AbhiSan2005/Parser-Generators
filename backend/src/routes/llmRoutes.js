import express from "express";
import { generateRegex } from "../controllers/aiController.js";

const router = express.Router();

router.post("/ai/generate-regex", generateRegex);

export default router;