import express from "express";
import { getMissingLinens } from "../controllers/HilangController.js";

const router = express.Router();

router.get("/", getMissingLinens);

export default router;
