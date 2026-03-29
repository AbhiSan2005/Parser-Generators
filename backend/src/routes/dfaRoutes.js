import { getDfaById, generateDfa } from "../controllers/dfaController.js"
import express from "express"

const router = express.Router();

router.post("/dfa/:problem_id", generateDfa)
router.get("/dfa/:problem_id", getDfaById)

export default router;
