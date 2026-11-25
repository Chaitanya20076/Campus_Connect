
import { searchEvents } from "./tavilyService.js";
import { extractEventsFromSearch } from "./eventExtractionService.js";
import { validateExtractedEvents } from "./eventValidationService.js";
import { deduplicateEvents } from "../../utils/eventDeduplication.js";
import { generateCCID } from "../../utils/generateCCID.js";
import { findEventCoverImage } from "./eventImageService.js";

// Temporary in-memory cache.
// CCIDs remain stable while this server process is running.
const ccidCache = new Map();

function createEventIdentity(event) {
  const normalise = (value = "") =>
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  return [
    normalise(event.eventName),
    normalise(event.organizer || ""),
    event.dates?.eventStart || "",
  ].join("|");
}

function assignCCID(event) {
  const identity = createEventIdentity(event);

  if (!ccidCache.has(identity)) {
    ccidCache.set(identity, generateCCID());
  }

  return {
    ...event,
    ccid: ccidCache.get(identity),
  };
}

async function enrichEventImages(events) {
  // Limit image searches to avoid excessive Tavily API usage.
  const imageSearchLimit = Math.min(events.length, 5);

  const enrichedEvents = await Promise.all(
    events.map(async (event, index) => {
      if (event.coverImageUrl) {
        return {
          ...event,
          imageStatus: "image_url_provided_by_source",
        };
      }

      if (index >= imageSearchLimit) {
        return {
          ...event,
          coverImageUrl: null,
          imageStatus: "not_searched",
        };
      }

      try {
        const imageResult = await findEventCoverImage(event);

        return {
          ...event,
          coverImageUrl: imageResult.imageUrl,
          imageStatus: imageResult.found
            ? "candidate_unverified"
            : "not_found",
        };
      } catch (error) {
        console.error(
          `Image lookup failed for ${event.eventName}:`,
          error.message
        );

        return {
          ...event,
          coverImageUrl: null,
          imageStatus: "lookup_failed",
        };
      }
    })
  );

  return enrichedEvents;
}

export async function discoverEvents({
  query,
  location = "",
  category = "",
  maxResults = 10,
  includeImages = true,
}) {
  if (!query || typeof query !== "string" || !query.trim()) {
    throw new Error("Please provide an event search query");
  }

  console.log("🔎 Starting event discovery...");
  console.log("Search:", query);
  console.log("Location:", location || "Any location");
  console.log("Category:", category || "All categories");

  // 1. Search the live web using Tavily.
  const searchResult = await searchEvents({
    query,
    location,
    category,
    maxResults,
  });

  if (!searchResult.results.length) {
    return {
      success: true,
      search: {
        query: searchResult.query,
        totalSources: 0,
      },
      statistics: {
        extracted: 0,
        valid: 0,
        rejected: 0,
        duplicatesRemoved: 0,
        finalEvents: 0,
      },
      events: [],
    };
  }

  console.log(`🌐 Tavily found ${searchResult.totalResults} sources`);

  // 2. Extract event information using Sarvam.
  const extractionResult = await extractEventsFromSearch(
    searchResult.results
  );

  console.log(
    `🤖 Sarvam extracted ${extractionResult.extractedCount} events`
  );

  // 3. Validate the extracted information.
  const validationResult = validateExtractedEvents(
    extractionResult.events
  );

  console.log(
    `✅ Valid events: ${validationResult.validCount}`
  );

  // 4. Remove duplicate events.
  const deduplicationResult = deduplicateEvents(
    validationResult.events
  );

  console.log(
    `♻️ Duplicates removed: ${deduplicationResult.duplicatesRemoved}`
  );

  // 5. Retrieve event cover images where needed.
  let processedEvents = deduplicationResult.events;

  if (includeImages) {
    processedEvents = await enrichEventImages(processedEvents);
  } else {
    processedEvents = processedEvents.map((event) => ({
      ...event,
      imageStatus: event.coverImageUrl
        ? "image_url_provided_by_source"
        : "not_requested",
    }));
  }

  // 6. Assign unique CampusConnect IDs.
  processedEvents = processedEvents.map(assignCCID);

  console.log(
    `🎉 Event discovery completed: ${processedEvents.length} events`
  );

  return {
    success: true,

    search: {
      query: searchResult.query,
      totalSources: searchResult.totalResults,
    },

    statistics: {
      extracted: extractionResult.extractedCount,
      valid: validationResult.validCount,
      rejected: validationResult.rejectedCount,
      duplicatesRemoved: deduplicationResult.duplicatesRemoved,
      finalEvents: processedEvents.length,
    },

    rejectedEvents: validationResult.rejectedEvents,

    events: processedEvents,
  };
}
