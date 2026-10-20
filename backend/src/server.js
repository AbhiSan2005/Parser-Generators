import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { connectDB } from "./utils/connectDB.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import llmRoutes from "./routes/llmRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import algorithmRoutes from "./routes/algorithmRoutes.js";
import playgroundRoutes from "./routes/playgroundRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Auth & Users
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/", userRoutes);
app.use("/api", userRoutes);

// Workspaces, Algorithms, LLM, Playgrounds
app.use("/", workspaceRoutes);
app.use("/", algorithmRoutes);
app.use("/", llmRoutes);
app.use("/playgrounds", playgroundRoutes);
app.use("/api", workspaceRoutes);
app.use("/api", algorithmRoutes);
app.use("/api", llmRoutes);
app.use("/api/playgrounds", playgroundRoutes);

app.get("/status", (req, res) => {
    res.json({
        status: `Server is Running on Port ${PORT}`
    });
});

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
