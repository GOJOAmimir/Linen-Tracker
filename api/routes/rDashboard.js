import express from "express";
import { getStatusSummary } from "../controllers/DashboardController.js";

const router = express.Router();

router.get("/status-summary", getStatusSummary);

export default router;
