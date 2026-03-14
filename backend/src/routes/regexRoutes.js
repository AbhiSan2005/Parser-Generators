import { generateRegex, getRegexById, getUserRegexes } from "../controllers/regexController.js";
import express from "express"

const router = express.Router();

router.post("/regex", generateRegex);
router.get("/regex/:problem_id", getRegexById);
router.get("/regex/user/:user_id", getUserRegexes);

export default router;
