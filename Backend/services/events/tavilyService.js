import "dotenv/config";

import {
  SOCIAL_HOSTS,
  EVENT_PLATFORM_HOSTS,
  hostOf,
  hostMatches,
  isListingPage,
  classifySource,
  urlKey,
  mergeSourcesByUrl,
  rankRelevantSources,
  buildEventNameVariants,
} from "./eventEvidenceUtils.js";

const TAVILY_API_URL = "https://api.tavily.com/search";

// Tavily is a semantic search engine: long keyword-stuffed queries dilute
// the ranking and can exceed its recommended length. Keep queries short.
const MAX_QUERY_LENGTH = 380;

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
  "register now",
  "apply now",
];

function truncateQuery(text) {
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

function hasEventPageSignals(item) {
  const combined = `${item.title || ""} ${item.content || ""}`.toLowerCase();

  return EVENT_TERMS.some((term) => combined.includes(term));
}

// Social posts cannot be verified, so they are dropped. Directory/listing
// pages are KEPT (they name many events and are excellent discovery leads)
// but flagged so they are never used as proof of an event's dates.
function isUsableEventSource(item) {
  if (!item?.url || !item?.title) return false;

  if (hostMatches(hostOf(item.url), SOCIAL_HOSTS)) return false;

  return hasEventPageSignals(item);
}

function getCurrentIndiaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    values[part.type] = part.value;
  }

  return `${values.year}-${values.month}-${values.day}`;
}

function getCurrentAndNextYear() {
  const currentYear = Number(getCurrentIndiaDate().slice(0, 4));

  return { currentYear, nextYear: currentYear + 1 };
}

function mapTavilyResults(data) {
  return (data.results || []).map((item) => {
    const url = item.url || "";

    return {
      title: item.title || "",
      url,
      content: item.content || "",
      rawContent: item.raw_content || "",
      publishedDate: item.published_date || null,
      score: item.score ?? null,
      sourceType: classifySource(url),
      pageKind: isListingPage(url) ? "listing_page" : "event_page",
    };
  });
}

async function requestTavily(
  query,
  maxResults,
  { searchDepth = "advanced", includeDomains = null } = {}
) {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is missing from the .env file");
  }

  const body = {
    api_key: apiKey,
    query,
    topic: "general",
    search_depth: searchDepth,
    max_results: Math.min(Math.max(Number(maxResults) || 5, 1), 20),
    include_answer: false,
    include_raw_content: true,
  };

  if (Array.isArray(includeDomains) && includeDomains.length) {
    body.include_domains = includeDomains;
  }

  const response = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        `Tavily API returned status ${response.status}`
    );
  }

  return mapTavilyResults(data);
}

// Runs several searches in parallel. One failing search does not discard
// the others; only if every search fails is the first error thrown.
async function runSearches(plans, maxResults) {
  const settled = await Promise.allSettled(
    plans.map((plan) => requestTavily(plan.text, maxResults, plan.options))
  );

  const fulfilled = settled.filter((item) => item.status === "fulfilled");

  if (!fulfilled.length) {
    throw settled[0].reason;
  }

  return mergeSourcesByUrl(fulfilled.flatMap((item) => item.value));
}

function byScoreDescending(a, b) {
  return (b.score ?? 0) - (a.score ?? 0);
}

export async function searchEvents({
  query,
  location = "",
  category = "",
  maxResults = 10,
}) {
  if (!query || typeof query !== "string" || !query.trim()) {
    throw new Error("A valid search query is required");
  }

  const currentDate = getCurrentIndiaDate();
  const { currentYear, nextYear } = getCurrentAndNextYear();

  const cleanQuery = query.trim();
  const cleanLocation = typeof location === "string" ? location.trim() : "";

  const queryAlreadyHasLocation =
    cleanLocation &&
    cleanQuery.toLowerCase().includes(cleanLocation.toLowerCase());

  const core = [
    cleanQuery,
    cleanLocation && !queryAlreadyHasLocation ? cleanLocation : "",
    category || "",
  ]
    .filter(Boolean)
    .join(" ");

  const years = `${currentYear} ${nextYear}`;

  const plans = [
    {
      // 1. Open web: short natural query.
      text: truncateQuery(`${core} ${years}`),
      options: { searchDepth: "advanced" },
    },
    {
      // 2. Same intent, restricted to event platforms that publish
      //    dedicated, dated pages for individual events.
      text: truncateQuery(`${core} registration ${years}`),
      options: {
        searchDepth: "advanced",
        includeDomains: EVENT_PLATFORM_HOSTS,
      },
    },
  ];

  try {
    const allResults = await runSearches(plans, maxResults);
    const results = allResults.filter(isUsableEventSource).sort(byScoreDescending);

    const listingResults = results.filter(
      (item) => item.pageKind === "listing_page"
    ).length;

    console.log(
      `🔎 Tavily sources: ${allResults.length} found, ${results.length} usable (${listingResults} listing pages), ${allResults.length - results.length} filtered`
    );

    return {
      success: true,
      query: plans[0].text,
      queries: plans.map((plan) => plan.text),
      currentDate,
      totalResults: allResults.length,
      usableResults: results.length,
      filteredResults: allResults.length - results.length,
      listingResults,
      results,
    };
  } catch (error) {
    console.error("Tavily event search error:", error.message);

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new Error("Tavily search timed out. Please try again.");
    }

    throw new Error(`Event web search failed: ${error.message}`);
  }
}

// Dedicated search for an already-extracted event. Results are NOT treated
// as verified: the extraction service must still quote them.
//
// The name is deliberately NOT wrapped in quotation marks. Extracted names
// such as "Fix My Itch Buildathon: Razorpay Rize x AILC" rarely appear
// verbatim anywhere, so a phrase search returns nothing.
export async function searchEventDetails({
  eventName,
  organizer = "",
  location = "",
  maxResults = 8,
}) {
  if (!eventName || typeof eventName !== "string" || !eventName.trim()) {
    throw new Error("An event name is required for verification");
  }

  const currentDate = getCurrentIndiaDate();
  const { currentYear, nextYear } = getCurrentAndNextYear();

  const cleanOrganizer = typeof organizer === "string" ? organizer.trim() : "";
  const cleanLocation = typeof location === "string" ? location.trim() : "";

  const variants = buildEventNameVariants(eventName);
  const baseName = variants[variants.length - 1];

  const plans = [
    {
      text: truncateQuery(
        `${[variants[0], cleanOrganizer, cleanLocation].filter(Boolean).join(" ")} ${currentYear} ${nextYear} dates registration schedule`
      ),
      options: { searchDepth: "advanced" },
    },
    {
      text: truncateQuery(`${[baseName, cleanLocation].filter(Boolean).join(" ")} ${currentYear}`),
      options: { searchDepth: "basic", includeDomains: EVENT_PLATFORM_HOSTS },
    },
  ];

  try {
    const allResults = await runSearches(plans, maxResults);
    const usable = allResults.filter(isUsableEventSource);

    // Keep only pages that are actually about THIS event (and edition).
    const results = rankRelevantSources(usable, eventName, {
      minRatio: 0.6,
      max: maxResults,
    });

    console.log(
      `🔍 Event verification search for "${eventName}": ${allResults.length} found, ${results.length} relevant`
    );

    return {
      success: true,
      query: plans[0].text,
      queries: plans.map((plan) => plan.text),
      currentDate,
      totalResults: allResults.length,
      usableResults: results.length,
      results,
    };
  } catch (error) {
    console.error(
      `Tavily verification search failed for "${eventName}":`,
      error.message
    );

    // A verification search failure must not crash discovery.
    return {
      success: false,
      query: plans[0].text,
      queries: plans.map((plan) => plan.text),
      currentDate,
      totalResults: 0,
      usableResults: 0,
      results: [],
      error: error.message,
    };
  }
}