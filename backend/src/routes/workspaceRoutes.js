import express from "express";
import { 
    createWorkspace, 
    getUserWorkspaces, 
    getWorkspaceById,
    createTab,
    updateTab,
    deleteWorkspace,
    deleteTab,
    setActiveTab
} from "../controllers/workspaceController.js";

const router = express.Router();

// Workspace Routes
router.get("/workspaces/user/:user_id", getUserWorkspaces);
router.get("/workspaces/:workspace_id", getWorkspaceById);
router.post("/workspaces", createWorkspace);
router.delete("/workspaces/:workspace_id", deleteWorkspace);

// Tab Routes
router.post("/workspaces/:workspace_id/tabs", createTab);
router.put("/workspaces/:workspace_id/tabs/:tab_id", updateTab);
router.put("/workspaces/:workspace_id/active-tab", setActiveTab);
router.delete("/workspaces/:workspace_id/tabs/:tab_id", deleteTab);

export default router;