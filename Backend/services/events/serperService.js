
import "dotenv/config";

import {
  SOCIAL_HOSTS,
  hostOf,
  hostMatches,
  isListingPage,
  classifySource,
  mergeSourcesByUrl,
} from "./eventEvidenceUtils.js";

const SERPER_SEARCH_URL = "https://google.serper.dev/search";

const EVENT_TERMS = [
  "hackathon",
  "buildathon",
  "ideathon",
  "datathon",
  "codeathon",
  "conference",
  "summit",
  "conclave",
  "workshop",
  "bootcamp",
  "competition",
  "fest",
  "festival",
  "event",
  "meetup",
  "symposium",
  "challenge",
  "expo",
  "registration",
  "register",
  "apply",
];

const LISTING_PATH_TERMS = [
  "discover",
  "search",
  "category",
  "categories",
  "tag",
  "tags",
  "allhacks",
  "all-events",
  "upcoming-events",
  "event-list",
  "event-listing",
  "browse",
];

const LISTING_TITLE_PATTERNS = [
  /^(upcoming|all|latest|best|top)\s+.+\b(hackathons|events|workshops|competitions)\b/i,
  /\b(hackathons|events|workshops|competitions)\s+(in|near|across|around)\s+/i,
  /\b(hackathons|events)\s+\d{4}\s*[/|&-]\s*\d{4}\b/i,
  /\b(list|directory|calendar|schedule)\s+of\s+(upcoming\s+)?(hackathons|events|workshops)\b/i,
  /\b(browse|discover|explore)\s+(all\s+)?(hackathons|events|workshops)\b/i,
];

function getIndiaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getCurrentAndNextYear() {
  const currentYear = Number(getIndiaDate().slice(0, 4));

  return {
    currentYear,
    nextYear: currentYear + 1,
  };
}

function hasEventSignals(item) {
  const text = `${item.title || ""} ${item.content || ""}`.toLowerCase();

  return EVENT_TERMS.some((term) => text.includes(term));
}

/**
 * Identifies directory, search and category pages.
 *
 * This supplements eventEvidenceUtils.isListingPage(),
 * which primarily checks URL patterns.
 */
function isDirectoryOrListingPage(url, title = "", snippet = "") {
  if (!url) return false;

  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    return true;
  }

  const pathname = parsedUrl.pathname
    .toLowerCase()
    .replace(/\/+/g, "/");

  const segments = pathname
    .split("/")
    .filter(Boolean);

  // Known listing and discovery routes.
  if (
    segments.some((segment) =>
      LISTING_PATH_TERMS.includes(segment)
    )
  ) {
    return true;
  }

  // A plural event category followed by a generic category slug
  // is generally a directory, not an individual event page.
  const categoryRoutes = [
    "hackathons",
    "events",
    "workshops",
    "competitions",
    "conferences",
    "meetups",
    "challenges",
  ];

  const genericCategorySlugs = [
    "ai",
    "tech",
    "technology",
    "india",
    "bangalore",
    "bengaluru",
    "online",
    "offline",
    "upcoming",
    "2026",
    "2027",
    "all",
    "latest",
  ];

  for (let i = 0; i < segments.length - 1; i += 1) {
    if (
      categoryRoutes.includes(segments[i]) &&
      genericCategorySlugs.includes(segments[i + 1])
    ) {
      return true;
    }
  }

  // A category route ending in a location is usually a directory.
  if (
    segments.includes("hackathons") &&
    segments.length >= 2 &&
    ["in", "near", "by-location"].includes(
      segments[segments.length - 2]
    )
  ) {
    return true;
  }

  const pageText = `${title || ""} ${snippet || ""}`.trim();

  if (
    LISTING_TITLE_PATTERNS.some((pattern) =>
      pattern.test(pageText)
    )
  ) {
    return true;
  }

  // Retain the existing utility's listing-page detection.
  return isListingPage(url);
}

function isUsableEventSource(item) {
  if (!item?.url || !item?.title) {
    return false;
  }

  if (hostMatches(hostOf(item.url), SOCIAL_HOSTS)) {
    return false;
  }

  return hasEventSignals(item);
}

function mapOrganicResults(data) {
  const organic = Array.isArray(data.organic)
    ? data.organic
    : [];

  return organic.map((item) => {
    const url = item.link || item.url || "";
    const title = item.title || "";
    const snippet = item.snippet || "";

    const listingPage = isDirectoryOrListingPage(
      url,
      title,
      snippet
    );

    return {
      title,
      url,

      content: snippet,

      // Serper returns search snippets, not full page content.
      rawContent: snippet,

      publishedDate: item.date || null,

      score: Number.isFinite(item.position)
        ? 1 / Math.max(item.position, 1)
        : null,

      sourceType: classifySource(url),

      // Important: downstream extraction uses this field
      // to prevent directory pages becoming event destinations.
      pageKind: listingPage
        ? "listing_page"
        : "event_page",
    };
  });
}

async function requestSerper(query, maxResults) {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "SERPER_API_KEY is missing from the Backend .env file"
    );
  }

  const response = await fetch(SERPER_SEARCH_URL, {
    method: "POST",

    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      q: query,
      gl: "in",
      hl: "en",
      num: Math.min(
        Math.max(Number(maxResults) || 10, 1),
        20
      ),
    }),

    signal: AbortSignal.timeout(60000),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.message ||
      data.error ||
      `Serper API returned HTTP ${response.status}`;

    throw new Error(message);
  }

  return mapOrganicResults(data);
}

export async function searchEvents({
  query,
  location = "",
  category = "",
  maxResults = 10,
}) {
  if (
    !query ||
    typeof query !== "string" ||
    !query.trim()
  ) {
    throw new Error("A valid event search query is required");
  }

  const { currentYear, nextYear } = getCurrentAndNextYear();

  const cleanQuery = query.trim();

  const cleanLocation =
    typeof location === "string"
      ? location.trim()
      : "";

  const cleanCategory =
    typeof category === "string"
      ? category.trim()
      : "";

  const queryAlreadyHasLocation =
    cleanLocation &&
    cleanQuery.toLowerCase().includes(
      cleanLocation.toLowerCase()
    );

  const searchQuery = [
    cleanQuery,

    cleanLocation && !queryAlreadyHasLocation
      ? cleanLocation
      : "",

    cleanCategory,
    "events",
    `${currentYear} ${nextYear}`,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  try {
    console.log("🔎 Searching Google through Serper...");
    console.log("Serper query:", searchQuery);

    const allResults = await requestSerper(
      searchQuery,
      maxResults
    );

    const results = mergeSourcesByUrl(allResults)
      .filter(isUsableEventSource);

    const listingResults = results.filter(
      (item) => item.pageKind === "listing_page"
    ).length;

    const eventPageResults = results.filter(
      (item) => item.pageKind === "event_page"
    ).length;

    console.log(
      `🔎 Serper returned ${allResults.length} results; ` +
      `${results.length} usable.`
    );

    console.log(
      `📄 Event-specific candidates: ${eventPageResults}`
    );

    console.log(
      `📚 Listing/category pages: ${listingResults}`
    );

    return {
      success: true,
      provider: "serper",
      query: searchQuery,
      queries: [searchQuery],
      currentDate: getIndiaDate(),

      totalResults: allResults.length,
      usableResults: results.length,
      filteredResults: allResults.length - results.length,

      listingResults,
      eventPageResults,

      results,
    };
  } catch (error) {
    console.error(
      "Serper event search failed:",
      error.message
    );

    if (
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      throw new Error(
        "Serper search timed out. Please try again."
      );
    }

    throw new Error(
      `Event web search failed: ${error.message}`
    );
  }
}
