import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./utils/connectDB.js";

import userRoutes from "./routes/userRoutes.js";
import llmRoutes from "./routes/llmRoutes.js";
// import cfgRoutes from "./routes/cfgRoutes.js"; // remove this Abhiraj
import workspaceRoutes from "./routes/workspaceRoutes.js";
import algorithmRoutes from "./routes/algorithmRoutes.js";
import playgroundRoutes from "./routes/playgroundRoutes.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", userRoutes);
app.use("/", workspaceRoutes);
app.use("/", algorithmRoutes);
app.use("/", llmRoutes);
// app.use("/", cfgRoutes); // Remove
app.use("/playground", playgroundRoutes)

app.get("/status", (req, res) => {
    res.json({
        status: "Server is Running on Port 5000"
    });
});

connectDB().then(() => {
    app.listen(5000, () => console.log("Server started on port 5000"));
});