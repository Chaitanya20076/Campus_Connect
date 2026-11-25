
import express from "express";

import {
  discoverEventsController,
  getEventDetailsController,
} from "../controllers/eventController.js";

import {
  chatbotMessageController,
} from "../controllers/chatbotController.js";

const router = express.Router();

// ------------------------------------
// EVENT DISCOVERY
// ------------------------------------

// POST /api/events/discover
router.post("/discover", discoverEventsController);

// ------------------------------------
// AI CHATBOT
// ------------------------------------

// POST /api/events/chatbot/message
router.post("/chatbot/message", chatbotMessageController);

// ------------------------------------
// INDIVIDUAL EVENT DETAILS
// ------------------------------------

// GET /api/events/:ccid
router.get("/:ccid", getEventDetailsController);

export default router;
