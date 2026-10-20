import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        sparse: true,
        trim: true,
        lowercase: true
    },
    user_id: {
        type: String,
        default: () => uuidv4().substring(0, 8),
        unique: true
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    avatar: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: false
    }
}, { timestamps: true });

export default mongoose.model("User", UserSchema, "users");
