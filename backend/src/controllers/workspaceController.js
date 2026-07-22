import Workspace from "../models/Workspace.js";
import { v4 as uuidv4 } from "uuid";

export const createWorkspace = async (req, res) => {
    try {
        const { username, user_id, title, description } = req.body;

        const newWorkspace = new Workspace({
            username,
            user_id,
            title: title || 'Untitled Workspace',
            description: description || '',
            tabs: []
        });

        const savedWorkspace = await newWorkspace.save();

        res.json({
            success: true, data: savedWorkspace
        });
    } catch (error) {
        res.json({
            success: false, Error: error.message
        });
    }
};

export const getUserWorkspaces = async (req, res) => {
    try {
        const { user_id } = req.params;
        const workspaces = await Workspace.find({ user_id }).select('-tabs');

        res.json({
            success: true, data: workspaces
        });
    } catch (error) {
        res.json({
            success: false, Error: error.message
        });
    }
};

export const getWorkspaceById = async (req, res) => {
    try {
        const { workspace_id } = req.params;
        const workspace = await Workspace.findOne({ workspace_id });

        if (!workspace) {
            return res.status(404).json({
                success: false, Error: "Workspace not found"
            });
        }

        res.json({
            success: true, data: workspace
        });
    } catch (error) {
        res.json({
            success: false, Error: error.message
        });
    }
};

export const createTab = async (req, res) => {
    try {
        const { workspace_id } = req.params;
        const { tabName, language_type } = req.body;

        const generatedTabId = uuidv4().substring(0, 8); // Generate ID

        const newTab = {
            tab_id: generatedTabId,
            tabName: tabName || "New Tab",
            language_type: language_type || "UNKNOWN",
            automatonType: "EMPTY",
            machine_data: {},
            canvas_metadata: { last_saved_mode: "manual" }
        };

        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { workspace_id },
            {
                $push: { tabs: newTab },
                $set: { activeTabId: generatedTabId }
            },
            { new: true }
        );

        if (!updatedWorkspace) {
            return res.status(404).json({
                success: false, Error: "Workspace not found"
            });
        }

        res.json({
            success: true, data: updatedWorkspace
        });
    } catch (error) {
        res.json({
            success: false, Error: error.message
        });
    }
};

export const updateTab = async (req, res) => {
    try {
        const { workspace_id, tab_id } = req.params;
        const updateData = req.body;

        let setQuery = {};
        for (const key in updateData) {
            setQuery[`tabs.$.${key}`] = updateData[key];
        }

        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { workspace_id, "tabs.tab_id": tab_id },
            { $set: setQuery },
            { new: true }
        );

        if (!updatedWorkspace) {
            return res.status(404).json({
                success: false, Error: "Workspace or Tab not found"
            });
        }
        res.json({
            success: true, data: updatedWorkspace
        });
    } catch (error) {
        res.json({
            success: false, Error: error.message
        });
    }
};

export const setActiveTab = async (req, res) => {
    try {
        const { workspace_id } = req.params;
        const { activeTabId } = req.body;

        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { workspace_id },
            { $set: { activeTabId: activeTabId } },
            { new: true }
        );

        if (!updatedWorkspace) {
            return res.status(404).json({
                success: false, Error: "Workspace not found"
            });
        }

        res.json({
            success: true, data: updatedWorkspace
        });
    } catch (error) {
        res.json({
            success: false, Error: error.message
        });
    }
};

export const deleteWorkspace = async (req, res) => {
    try {
        const { workspace_id } = req.params;
        const deletedWorkspace = await Workspace.findOneAndDelete({ workspace_id });

        if (!deletedWorkspace) {
            return res.status(404).json({
                success: false, Error: "Workspace not found"
            });
        }

        res.json({
            success: true, message: "Workspace deleted successfully"
        });
    } catch (error) {
        res.json({
            success: false, Error: error.message
        });
    }
};

export const updateWorkspace = async (req, res) => {
    try {
        const { workspace_id } = req.params;
        const { title, description } = req.body;

        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { workspace_id },
            { $set: { title, description } },
            { new: true }
        );

        if (!updatedWorkspace) {
            return res.status(404).json({
                success: false, Error: "Workspace not found"
            });
        }

        res.json({
            success: true, data: updatedWorkspace
        });
    } catch (error) {
        res.json({
            success: false, Error: error.message
        });
    }
};

export const deleteTab = async (req, res) => {
    try {
        const { workspace_id, tab_id } = req.params;

        const updatedWorkspace = await Workspace.findOneAndUpdate(
            { workspace_id },
            { $pull: { tabs: { tab_id: tab_id } } },
            { new: true }
        );

        if (!updatedWorkspace) {
            return res.status(404).json({
                success: false, Error: "Workspace not found"
            });
        }
        res.json({
            success: true, data: updatedWorkspace
        });
    } catch (error) {
        res.json({
            success: false, Error: error.message
        });
    }
};