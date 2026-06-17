import dotenv from "dotenv"
import express from "express";
import cors from "cors"
import {connectDB} from "./utils/connectDB.js"
import userRoutes from "./routes/userRoutes.js"
import regexRoutes from "./routes/regexRoutes.js"
import enfaRoutes from "./routes/enfaRoutes.js"
import dfaRoutes from "./routes/dfaRoutes.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use("/", userRoutes)
app.use("/", regexRoutes)
app.use("/", enfaRoutes)
app.use("/", dfaRoutes)

app.get("/status", (req, res) => {
    res.json({
        "status": "Server is Running on Port 5000"
    })
})

connectDB().then(() => {
    app.listen(5000);
})