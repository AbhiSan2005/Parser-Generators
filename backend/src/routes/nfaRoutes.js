import { generateNfa, getNfaById } from "../controllers/nfaController.js";
import express from "express";

const router = express.Router();

router.post("/nfa/:problem_id", generateNfa);
router.get("/nfa/:problem_id", getNfaById);

export default router;