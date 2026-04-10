import express from "express";
import { MasterLinen } from "../controllers/LinenMasterController.js";

const router = express.Router();

router.get("/", MasterLinen);

export default router;
