import { getEnfaById, generateEnfaById, generateEnfaByRegex } from "../controllers/enfaController.js";
import express from "express"

const router = express.Router();

router.post("/enfa/regex", generateEnfaByRegex);
router.get("/enfa/:problem_id", getEnfaById);
router.post("/enfa/:problem_id", generateEnfaById);

export default router;
