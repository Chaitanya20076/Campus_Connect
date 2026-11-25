
import express from "express";
import { discoverEventsController } from "../controllers/eventController.js";

const router = express.Router();

// POST /api/events/discover
router.post("/discover", discoverEventsController);

export default router;
