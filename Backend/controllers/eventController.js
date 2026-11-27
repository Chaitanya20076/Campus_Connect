
import { discoverEvents } from "../services/events/eventDiscoveryService.js";
import { getEventByCCID } from "../services/events/eventStore.js";

// POST /api/events/discover
export async function discoverEventsController(req, res) {
  try {
    console.log("📥 Event discovery request received");

    const {
      query = "",
      location = "",
      category = "",
      maxResults = 10,
      includeImages = true,
    } = req.body || {};

    const cleanQuery =
      typeof query === "string" ? query.trim() : "";

    const cleanLocation =
      typeof location === "string" ? location.trim() : "";

    const cleanCategory =
      typeof category === "string" ? category.trim() : "";

    // At least one filter must be provided.
    if (!cleanQuery && !cleanLocation && !cleanCategory) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one search filter: query, location, or category",
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

    const result = await discoverEvents({
      query: cleanQuery,
      location: cleanLocation,
      category: cleanCategory,
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

// GET /api/events/:ccid
export function getEventDetailsController(req, res) {
  try {
    const { ccid } = req.params;

    console.log(`📥 Event details requested: ${ccid}`);

    if (!ccid || !/^CC-\d{4}-[A-F0-9]{8}$/i.test(ccid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid CampusConnect Event ID",
      });
    }

    const event = getEventByCCID(ccid.toUpperCase());

    if (!event) {
      return res.status(404).json({
        success: false,
        message:
          "Event not found. It may not have been discovered in this server session.",
        ccid: ccid.toUpperCase(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event details retrieved successfully",
      event,
    });

  } catch (error) {
    console.error("Event details controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve event details",
    });
  }
}
