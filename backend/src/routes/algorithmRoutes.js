import express from "express";
import { executeAlgorithm } from "../controllers/algorithmController.js";

const router = express.Router();

router.post("/workspaces/:workspace_id/tabs/:tab_id/execute", executeAlgorithm);

export default router;