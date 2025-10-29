import express from "express";
import { LoginHandler } from "../controllers/loginController.js";

const router = express.Router();

router.post("/", LoginHandler);
export default router;
