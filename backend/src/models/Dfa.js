import mongoose, { mongo } from "mongoose";

const DfaSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true,
    },
    problem_id: {
        type: String,
        required: true
    },
    alphabet: [
        { type: String }
    ],
    states: [
        { type: String }
    ],
    initial_states: [
        { type: String }
    ],
    final_states: [
        { type: String }
    ],
    transitions: [
        {
            _id: false,
            from: String,
            to: String,
            symbol: String
        }
    ],
    adjacency_list: {
        type: mongoose.Schema.Types.Mixed
    },
    state_mapping: {
        type: mongoose.Schema.Types.Mixed
    }
}, {timestamps: true, minimize: false})

export default mongoose.model("Dfa", DfaSchema, "dfas");