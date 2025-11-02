import express from "express";
import { storage_out, storage_keep_log, storage_out_log, getInventorySummary, getRowType} from "../controllers/InventoryController.js";
import { storage_keep_by_type } from "../controllers/InventoryController.js";

const router = express.Router();

router.get("/storage_out", storage_out);
router.get("/storage_keep_log", storage_keep_log);
router.get("/storage_out_log", storage_out_log);
router.get("/summary", getInventorySummary);
router.get("/storage", getRowType);
router.get("/storage/:tipe", storage_keep_by_type);

export default router;
