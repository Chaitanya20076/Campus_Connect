
import express from "express";

import {
  discoverEventsController,
  getEventDetailsController,
} from "../controllers/eventController.js";

const router = express.Router();

// Discover events using Tavily and Sarvam.
router.post("/discover", discoverEventsController);

// Retrieve an individual event using its CCID.
router.get("/:ccid", getEventDetailsController);

export default router;
