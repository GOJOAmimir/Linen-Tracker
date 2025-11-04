import { LatestBatchController } from "../controllers/LatestBatchController.js";
import express from "express";

const router = express.Router();

router.get("/", LatestBatchController);
export default router;
