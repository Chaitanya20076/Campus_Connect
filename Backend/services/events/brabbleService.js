import "dotenv/config";

const BRABBLE_API_URL = "https://brabble.ai/api/listings";

const CITY_FILTERS = new Set([
  "delhi-ncr",
  "indore",
  "hyderabad",
  "pune",
  "ahmedabad",
  "bhopal",
  "bengaluru",
  "mumbai",
  "chennai",
  "kolkata",
  "jaipur",
  "lucknow",
]);

const TYPE_FILTERS = new Set([
  "HACKATHON",
  "CASE STUDY",
  "CONTEST",
  "CODING",
  "INNOVATION",
  "DESIGN",
  "COMPETITION",
  "QUIZ",
]);

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normaliseCity(value) {
  const city = clean(value).toLowerCase();
  const aliases = {
    bangalore: "bengaluru",
    "new delhi": "delhi-ncr",
    delhi: "delhi-ncr",
  };

  const normalized = aliases[city] || city.replace(/\s+/g, "-");
  return CITY_FILTERS.has(normalized) ? normalized : null;
}

function normaliseType(category) {
  const value = clean(category).toUpperCase().replace(/[_-]+/g, " ");
  const aliases = {
    HACKATHON: "HACKATHON",
    HACKATHONS: "HACKATHON",
    COMPETITION: "COMPETITION",
    COMPETITIONS: "COMPETITION",
    CONTEST: "CONTEST",
    "CODING CONTEST": "CODING",
    CODING: "CODING",
    "CASE COMPETITION": "CASE STUDY",
    "CASE COMPETITIONS": "CASE STUDY",
    "CASE STUDY": "CASE STUDY",
    QUIZ: "QUIZ",
    DESIGN: "DESIGN",
    INNOVATION: "INNOVATION",
  };

  const type = aliases[value] || value;
  return TYPE_FILTERS.has(type) ? type : null;
}

function buildParams({ query, location, category, maxResults }) {
  const params = new URLSearchParams();

  const normalizedCategory = clean(category).toLowerCase();
  if (normalizedCategory === "hackathon" || normalizedCategory === "hackathons") {
    params.set("hub", "hackathons");
  } else {
    const type = normaliseType(category);
    if (type) params.set("type", type);
  }

  const city = normaliseCity(location);
  if (city) params.set("city", city);

  if (clean(query)) params.set("q", clean(query));

  const limit = Math.min(Math.max(Number(maxResults) || 10, 1), 200);
  params.set("limit", String(limit));
  params.set("offset", "0");

  return params;
}

export async function fetchBrabbleListings({
  query = "",
  location = "",
  category = "",
  maxResults = 10,
} = {}) {
  const apiKey = process.env.BRABBLE_API_KEY;

  if (!apiKey) {
    throw new Error("BRABBLE_API_KEY is missing from the Backend .env file");
  }

  const params = buildParams({ query, location, category, maxResults });
  const url = `${BRABBLE_API_URL}?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(30000),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.error ||
      data.message ||
      `Brabble API returned HTTP ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.provider = "brabble";
    throw error;
  }

  if (!Array.isArray(data.listings)) {
    throw new Error("Brabble returned an unexpected response: listings[] is missing");
  }

  return {
    provider: "brabble",
    query: clean(query),
    totalResults: Number(data.total) || data.listings.length,
    returnedResults: data.listings.length,
    refreshedAt: data.refreshedAt || null,
    origin: data.origin || null,
    rateLimit: {
      limit: response.headers.get("x-ratelimit-limit"),
      remaining: response.headers.get("x-ratelimit-remaining"),
      reset: response.headers.get("x-ratelimit-reset"),
    },
    attribution: data.attribution || null,
    docs: data.docs || "https://brabble.ai/docs",
    listings: data.listings,
  };
}
