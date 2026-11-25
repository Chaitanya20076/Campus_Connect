
import "dotenv/config";

const TAVILY_API_URL = "https://api.tavily.com/search";

function isValidImageUrl(value) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);

    return (
      ["http:", "https:"].includes(url.protocol) &&
      /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(url.href)
    );
  } catch {
    return false;
  }
}

function getImageUrl(item) {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  return item.url || item.image_url || item.src || null;
}

export async function findEventCoverImage(event) {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is missing from .env");
  }

  if (!event?.eventName) {
    throw new Error("Event name is required to search for its poster");
  }

  const query = [
    `"${event.eventName}"`,
    event.organizer || "",
    event.dates?.eventStart || "",
    "official event poster hackathon",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        topic: "general",
        search_depth: "advanced",
        max_results: 5,
        include_images: true,
        include_image_descriptions: true,
        include_raw_content: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.message ||
        `Tavily returned status ${response.status}`
      );
    }

    const images = Array.isArray(data.images) ? data.images : [];

    const candidates = images
      .map((item) => ({
        url: getImageUrl(item),
        description:
          typeof item === "object"
            ? item.description || ""
            : "",
      }))
      .filter((item) => isValidImageUrl(item.url));

    if (candidates.length === 0) {
      return {
        imageUrl: null,
        source: null,
        found: false,
        message: "No suitable event cover image was found",
      };
    }

    // Prefer image descriptions that mention the event or organiser.
    const eventName = event.eventName.toLowerCase();
    const organizer = (event.organizer || "").toLowerCase();

    const ranked = candidates.map((candidate) => {
      const description = candidate.description.toLowerCase();

      let score = 0;

      if (description.includes(eventName)) score += 3;
      if (organizer && description.includes(organizer)) score += 2;
      if (description.includes("poster")) score += 2;
      if (description.includes("event")) score += 1;

      return {
        ...candidate,
        score,
      };
    });

    ranked.sort((a, b) => b.score - a.score);

    const best = ranked[0];

    return {
      imageUrl: best.url,
      source: "tavily_image_search",
      found: true,
      confidence: best.score >= 3 ? "candidate" : "unconfirmed",
      message:
        "Image discovered. It must be checked against the official event source before being labelled as an official poster.",
    };
  } catch (error) {
    console.error("Event image search error:", error.message);

    throw new Error(`Event image search failed: ${error.message}`);
  }
}
