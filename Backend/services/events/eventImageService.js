
import "dotenv/config";

const SERPER_IMAGES_URL = "https://google.serper.dev/images";

function getImageUrl(item) {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  return (
    item.imageUrl ||
    item.image_url ||
    item.url ||
    item.thumbnailUrl ||
    item.thumbnail ||
    null
  );
}

function isValidImageUrl(value) {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export async function findEventCoverImage(event) {
  if (!event?.eventName) {
    throw new Error(
      "Event name is required to search for its poster"
    );
  }

  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "SERPER_API_KEY is missing from the Backend .env file"
    );
  }

  const query = [
    `"${event.eventName}"`,
    event.organizer || "",
    "event poster",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const response = await fetch(SERPER_IMAGES_URL, {
      method: "POST",

      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        q: query,
        gl: "in",
        hl: "en",
        num: 5,
      }),

      signal: AbortSignal.timeout(60000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        `Serper image search returned HTTP ${response.status}`
      );
    }

    const images = Array.isArray(data.images)
      ? data.images
      : [];

    const candidates = images
      .map((item) => ({
        url: getImageUrl(item),
        title: item?.title || "",
        sourceUrl: item?.link || item?.source || null,
      }))
      .filter((item) => isValidImageUrl(item.url));

    if (!candidates.length) {
      return {
        imageUrl: null,
        source: null,
        found: false,
        message: "No event image was found.",
      };
    }

    const eventName = event.eventName.toLowerCase();
    const organizer = (event.organizer || "").toLowerCase();

    function getImageScore(item) {
      const title = item.title.toLowerCase();

      let score = 0;

      if (title.includes(eventName)) {
        score += 3;
      }

      if (organizer && title.includes(organizer)) {
        score += 2;
      }

      if (title.includes("poster")) {
        score += 1;
      }

      return score;
    }

    candidates.sort(
      (a, b) => getImageScore(b) - getImageScore(a)
    );

    const best = candidates[0];

    return {
      imageUrl: best.url,
      source: "serper_image_search",
      sourceUrl: best.sourceUrl,
      found: true,
      confidence: "unconfirmed",
      message:
        "Image discovered through image search. It has not been confirmed as the official event poster.",
    };
  } catch (error) {
    console.error(
      "Serper event image search error:",
      error.message
    );

    throw new Error(
      `Event image search failed: ${error.message}`
    );
  }
}
