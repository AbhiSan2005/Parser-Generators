import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const tabSchema = new mongoose.Schema({
    tab_id: { 
        type: String, default: () => uuidv4().substring(0, 8) 
    },
    tabName: { 
        type: String, required: true 
    },
    language_type: {
        type: String,
        required: true,
        enum: ['REGULAR', 'CONTEXT_FREE', 'CONTEXT_SENSITIVE', 'TURING', 'UNKNOWN'],
        default: 'UNKNOWN'
    },
    automatonType: {
        type: String,
        enum: ['REGEX', 'ENFA', 'NFA', 'DFA', 'MIN_DFA', 'CFG', 'CNF', 'PDA', 'TM', 'EMPTY'],
        default: 'EMPTY'
    },
    machine_data: { type: mongoose.Schema.Types.Mixed, default: {} },
    canvas_metadata: {
        last_saved_mode: { type: String, enum: ['auto', 'manual'], default: 'manual' },
        manual_nodes: { type: Array, default: [] },
        manual_edges: { type: Array, default: [] },
        auto_nodes: { type: Array, default: [] },
        auto_edges: { type: Array, default: [] }
    }
});

const WorkspaceSchema = new mongoose.Schema({
    workspace_id: {
        type: String,
        default: () => uuidv4().substring(0, 8),
        unique: true
    },
    username: {
        type: String, required: true
    },
    user_id: {
        type: String, required: true
    },
    title: {
        type: String, default: 'Untitled Workspace'
    },
    description: {
        type: String, default: ''
    },
    activeTabId: {
        type: String
    },
    tabs: [tabSchema]
}, { timestamps: true });

export default mongoose.model("Workspace", WorkspaceSchema, "workspaces");