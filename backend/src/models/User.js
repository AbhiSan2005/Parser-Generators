import mongoose from "mongoose";
import {v4 as uuidv4} from "uuid";

const UserSchema = new  mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        default: () => uuidv4().substring(0, 8),
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("User", UserSchema, "users");