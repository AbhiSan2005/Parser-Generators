import express from "express"
import { getUsers, addUser } from "../controllers/userController.js"

const router = express.Router();

router.get("/users", getUsers);
router.post("/user", addUser);

export default router;