
import { discoverEvents } from "../services/events/eventDiscoveryService.js";

export async function discoverEventsController(req, res) {
  try {
    const {
      query,
      location = "",
      category = "",
      maxResults = 10,
      includeImages = true,
    } = req.body || {};

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid search query",
      });
    }

    const parsedMaxResults = Number(maxResults);

    if (
      !Number.isInteger(parsedMaxResults) ||
      parsedMaxResults < 1 ||
      parsedMaxResults > 20
    ) {
      return res.status(400).json({
        success: false,
        message: "maxResults must be a number between 1 and 20",
      });
    }

    if (typeof includeImages !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "includeImages must be true or false",
      });
    }

    console.log("📥 Event discovery request received");

    const result = await discoverEvents({
      query: query.trim(),
      location:
        typeof location === "string" ? location.trim() : "",
      category:
        typeof category === "string" ? category.trim() : "",
      maxResults: parsedMaxResults,
      includeImages,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Event discovery controller error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to discover events",
    });
  }
}
