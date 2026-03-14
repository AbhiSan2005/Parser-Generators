import mongoose from "mongoose";
import {v4 as uuidv4} from "uuid" 

const RegexSchema = new mongoose.Schema({
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
        default: () => uuidv4().substring(0, 8),
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    language_type: {
        type: String
    },
    regex: {
        type: String
    }
}, {timestamps: true})

export default mongoose.model("Regex", RegexSchema, "regexes");