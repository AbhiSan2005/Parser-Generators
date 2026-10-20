import express from "express";
import { googleAuth, getAuthUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/google", googleAuth);
router.get("/me/:user_id", getAuthUser);

export default router;
