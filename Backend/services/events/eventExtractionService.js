import { generateSarvamResponse } from "./sarvamService.js";

import {
  canonicalUrl,
  urlKey,
  extractUrlMatches,
  hostOf,
  hostMatches,
  SOCIAL_HOSTS,
  normaliseAlnum,
  normaliseForMatch,
  dateSupportedByText,
  buildEventNameVariants,
  buildSourceExcerpt,
  classifySource,
} from "./eventEvidenceUtils.js";

const MAX_DISCOVERY_SOURCES = 10;
const MAX_CANDIDATES = 10;
const MAX_VERIFICATION_SOURCES = 6;
const MIN_QUOTE_LENGTH = 8;

const EVENT_EXTRACTION_PROMPT = `
You are CampusConnect's event extraction engine.

Extract genuine student-relevant events from the supplied web sources.

STRICT RULES:
1. Never invent event information.
2. Use null when information is unavailable.
3. Copy URLs exactly from supplied sources.
4. Never manufacture or reconstruct URLs.
5. Prefer event-specific sources.
6. Do not confuse an event page with a registration page.
7. A registration URL requires explicit registration evidence.
8. Do not assume registration is open.
9. Do not assume an event is ongoing if its end date is unknown.
10. Do not combine details from different events.
11. Exclude unrelated results.
12. Return JSON only.
13. Pages marked "Page kind: listing_page" list many events. You may extract an event that such a page names, but only fill a date when the listing states it explicitly with a year.

DATE EXTRACTION RULES:
14. Search the entire supplied source content for dates, not just introductory text.
15. Extract registrationStart only when the registration opening date is explicitly stated.
16. Extract registrationDeadline only when the last registration date or deadline is explicitly stated.
17. Extract eventStart and eventEnd from the actual event schedule.
18. Never use a registration deadline as the event start or end date.
19. Recognise date ranges such as November 21-22, 2026, 21st to 22nd November 2026 and 30 Nov - 2 Dec 2026.
20. When a source gives a date range, extract both its beginning and ending dates.
21. A year must be explicitly supported by the source. Do not guess the year.
22. If a date has no clearly established year, return null.
23. Do not use a webpage's published date as the event date.
24. If multiple editions are mentioned, use only dates belonging to the exact event edition.
25. Keep each date separate and return dates in YYYY-MM-DD format.

Return this exact structure:
{
  "events": [
    {
      "eventName": "string",
      "description": "string or null",
      "category": "hackathon | workshop | competition | conference | seminar | meetup | fest | webinar | other",
      "organizer": "string or null",
      "location": {
        "city": "string or null",
        "venue": "string or null"
      },
      "mode": "online | offline | hybrid | unknown",
      "dates": {
        "registrationStart": "YYYY-MM-DD or null",
        "registrationDeadline": "YYYY-MM-DD or null",
        "eventStart": "YYYY-MM-DD or null",
        "eventEnd": "YYYY-MM-DD or null"
      },
      "registrationStatus": "open | closed | not_open | unknown",
      "eligibility": "string or null",
      "teamSize": {
        "minimum": "number or null",
        "maximum": "number or null"
      },
      "requiredSkills": [],
      "prizes": "string or null",
      "registrationUrl": "string or null",
      "officialWebsite": "string or null",
      "coverImageUrl": "string or null",
      "sources": [
        {
          "title": "string",
          "url": "string"
        }
      ],
      "verification": {
        "confidence": "high | medium | low",
        "notes": "string or null"
      }
    }
  ]
}

URL RULES:
- officialWebsite means an event information page.
- registrationUrl means an event-specific registration page.
- Never confuse the two.
- Every URL must occur in the supplied material.
- Return at most ${MAX_CANDIDATES} events.
- If no events are found, return {"events": []}.
`;

const EVENT_VERIFICATION_PROMPT = `
You are a strict evidence verification engine for CampusConnect.

You will receive:
1. A candidate event extracted earlier.
2. Source pages (event-specific search results plus the pages the candidate was discovered on).

Your job is to verify individual fields using ONLY the supplied source content.

IMPORTANT:
- Do not use outside knowledge.
- Do not infer missing dates.
- Combine evidence from different sources only when each field is individually supported by its own quotation.
- Do not confuse another year's or edition's page with this edition.
- Do not combine details from different events.
- If sources disagree, return null for the disputed field.
- Every non-null field must have a direct supporting quotation.
- Quotations must be copied exactly from the supplied source content (markdown symbols are ignored when checking).
- A source URL must be copied exactly from the supplied source.
- Each source is labelled with a Source type. Never describe a third_party_listing or unclassified_website as official.
- A registration URL must appear in the source content next to registration wording for this exact event.
- Return JSON only.

DATE RULES:
- Every date quotation MUST contain the full date INCLUDING THE YEAR. If the year is shown elsewhere on the page, quote a span (it may cover several lines) that contains both the day/month and the year.
- Never use a registration deadline as an event date, or an event date as a registration date.
- Never use a published or updated date as an event date.
- If the source says November 21-22, 2026, verify November 21 as eventStart and November 22 as eventEnd; one quotation containing the whole range may support both endpoints.
- Ranges across months (30 Nov - 2 Dec 2026) give eventStart 2026-11-30 and eventEnd 2026-12-02.
- Never infer a missing year.

LOCATION RULES:
- Return the city name exactly as it appears in the supporting quotation.
- Bangalore and Bengaluru are common names for the same city, but do not invent a city if neither name appears in the source.
- The quotation must explicitly identify the event location, not merely mention a city unrelated to the event.

Return this exact structure:
{
  "eventNameMatch": true,
  "dates": {
    "registrationStart": null,
    "registrationDeadline": null,
    "eventStart": null,
    "eventEnd": null
  },
  "location": {
    "city": null,
    "venue": null
  },
  "mode": null,
  "registrationStatus": null,
  "registrationUrl": null,
  "officialWebsite": null,
  "evidence": [
    {
      "field": "eventName | registrationStart | registrationDeadline | eventStart | eventEnd | city | venue | mode | registrationStatus | registrationUrl | officialWebsite",
      "value": "exact value returned above",
      "quote": "exact quotation from source",
      "sourceUrl": "exact source URL"
    }
  ]
}
`;

function parseSarvamJson(content) {
  const cleaned = String(content || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end <= start) throw error;

    parsed = JSON.parse(cleaned.slice(start, end + 1));
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Sarvam returned an invalid JSON object");
  }

  return parsed;
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

function getSourceContent(source) {
  return [source.title || "", source.content || "", source.rawContent || ""].join("\n");
}

const normalisedSourceCache = new WeakMap();

function getNormalisedSource(source) {
  if (!normalisedSourceCache.has(source)) {
    normalisedSourceCache.set(
      source,
      normaliseForMatch(getSourceContent(source))
    );
  }

  return normalisedSourceCache.get(source);
}

function formatSourceForPrompt(source, index, { withPublished = false } = {}) {
  const { content, raw } = buildSourceExcerpt(source);

  return `
SOURCE ${index + 1}
Title: ${source.title || "Unknown"}
URL: ${source.url || "Unavailable"}
Source type: ${source.sourceType || classifySource(source.url)}
Page kind: ${source.pageKind || "event_page"}${withPublished ? `\nPublished: ${source.publishedDate || "Unknown"}` : ""}

Search Result Content:
${content}

Full Page Content (excerpt):
${raw}
`;
}

// ---------------------------------------------------------------------------
// FIRST-STAGE URL SANITISING
// ---------------------------------------------------------------------------

function collectAllowedContentUrls(searchResults) {
  const urls = new Map();

  for (const source of searchResults) {
    const own = canonicalUrl(source.url);

    if (own && !urls.has(urlKey(own))) urls.set(urlKey(own), own);

    for (const match of extractUrlMatches(
      `${source.rawContent || ""}\n${source.content || ""}`
    )) {
      if (!urls.has(match.key)) urls.set(match.key, match.url);
    }
  }

  return urls;
}

function findSourceEvidence(event, searchResults) {
  const eventName = normaliseAlnum(event.eventName);

  if (!eventName || eventName.length < 5) return [];

  return searchResults.filter((source) =>
    normaliseAlnum(getSourceContent(source)).includes(eventName)
  );
}

const REGISTRATION_WORDS =
  /\b(register|registration|registrations|apply now|application form|sign up|signup|book tickets|buy tickets|register here|apply here)\b/i;

function hasRegistrationEvidence(url, sourceResults) {
  const key = urlKey(url);

  if (!key) return false;

  for (const source of sourceResults) {
    const content = getSourceContent(source);

    for (const match of extractUrlMatches(content)) {
      if (match.key !== key) continue;

      const nearby = content.slice(
        Math.max(0, match.index - 300),
        Math.min(content.length, match.index + match.length + 300)
      );

      if (REGISTRATION_WORDS.test(nearby)) return true;
    }
  }

  return false;
}

function keepAllowedUrl(value, allowedUrls) {
  const key = urlKey(value);

  return key && allowedUrls.has(key) ? allowedUrls.get(key) : null;
}

function sanitizeEventUrls(events, searchResults) {
  const allowedUrls = collectAllowedContentUrls(searchResults);
  const sanitizedEvents = [];

  for (const event of events) {
    if (!event || !event.eventName) continue;

    const supportingSources = findSourceEvidence(event, searchResults);

    if (!supportingSources.length) {
      console.warn(`No direct source evidence for: ${event.eventName}`);
      continue;
    }

    // Listing pages can provide discovery evidence,
    // but must never become the event's destination URL.
    const eventPageSources = supportingSources.filter(
      (source) =>
        source.pageKind !== "listing_page" &&
        !hostMatches(hostOf(source.url), SOCIAL_HOSTS)
    );

    const eventPageKeys = new Set(
      eventPageSources
        .map((source) => urlKey(source.url))
        .filter(Boolean)
    );

    const officialCandidate = keepAllowedUrl(
      event.officialWebsite,
      allowedUrls
    );

    const officialSource = eventPageSources.find(
      (source) =>
        urlKey(source.url) === urlKey(officialCandidate) &&
        classifySource(source.url, event) === "likely_official"
    );

    const officialWebsite = officialSource
      ? canonicalUrl(officialSource.url)
      : null;

    // Prefer an event-specific page for the event card's redirect.
    const eventPageUrl = eventPageSources.length
      ? canonicalUrl(eventPageSources[0].url)
      : null;

    const registrationCandidate = keepAllowedUrl(
      event.registrationUrl,
      allowedUrls
    );

    const registrationUrl =
      registrationCandidate &&
      hasRegistrationEvidence(registrationCandidate, supportingSources)
        ? registrationCandidate
        : null;

    const sources = supportingSources.map((source) => ({
      title: source.title || null,
      url: canonicalUrl(source.url),
      sourceType: classifySource(source.url, event),
      pageKind: source.pageKind || "event_page",
    }));

    sanitizedEvents.push({
      ...event,
      officialWebsite,
      eventPageUrl,
      eventPageSourceType: eventPageUrl
        ? classifySource(eventPageUrl, event)
        : null,
      registrationUrl,
      coverImageUrl: keepAllowedUrl(event.coverImageUrl, allowedUrls),
      sources,
      verification: {
        ...(event.verification || {}),
        sourceEvidenceFound: true,
        supportingSourceCount: supportingSources.length,
        eventPageFound: Boolean(eventPageUrl),
        registrationEvidenceFound: Boolean(registrationUrl),
        registrationLinkFound: Boolean(registrationUrl),
        officialSourceFound: Boolean(officialWebsite),
        notes: !eventPageUrl
          ? "The event was mentioned in discovery sources, but no event-specific destination page was found."
          : !registrationUrl
            ? "No event-specific registration link was verified in the supplied source material."
            : event.verification?.notes || null,
      },
    });
  }

  return sanitizedEvents;
}
// ---------------------------------------------------------------------------
// SECOND-STAGE EVIDENCE VERIFICATION
// ---------------------------------------------------------------------------

function quoteExistsInSource(quote, source) {
  if (!quote || typeof quote !== "string") return false;

  const requested = normaliseForMatch(quote);

  return (
    requested.length >= MIN_QUOTE_LENGTH &&
    getNormalisedSource(source).includes(requested)
  );
}

function buildSourceMap(searchResults) {
  const map = new Map();

  for (const source of searchResults) {
    const key = urlKey(source.url);

    if (key) map.set(key, source);
  }

  return map;
}

function getEvidenceSource(evidence, sourceMap, allSources) {
  const cited = sourceMap.get(urlKey(evidence?.sourceUrl));

  if (cited && quoteExistsInSource(evidence?.quote, cited)) return cited;

  return allSources.find((source) => quoteExistsInSource(evidence?.quote, source)) || null;
}

const MODE_PATTERNS = {
  offline: /\b(offline|in[- ]person|on[- ]campus|physical)\b/i,
  online: /\b(online|virtual|remote|webinar)\b/i,
  hybrid: /\bhybrid\b/i,
};

const REGISTRATION_STATUS_PATTERNS = {
  open: /\b(registrations?\s+(?:are\s+)?(?:now\s+)?open|open\s+for\s+registrations?)\b/i,
  closed: /\b(registrations?\s+(?:are\s+|is\s+|have\s+|has\s+)?(?:now\s+)?(?:closed|ended))\b/i,
  not_open: /\b(registrations?\s+(?:open|opens|opening)\s+(?:soon|on)|coming soon)\b/i,
};

// ---------------------------------------------------------------------------
// CITY ALIAS EVIDENCE
// ---------------------------------------------------------------------------

const CITY_EVIDENCE_ALIASES = [
  { city: "Bengaluru", names: ["Bengaluru", "Bangalore"] },
  { city: "Mumbai", names: ["Mumbai", "Bombay"] },
  { city: "Chennai", names: ["Chennai", "Madras"] },
  { city: "Kolkata", names: ["Kolkata", "Calcutta"] },
  { city: "Mysuru", names: ["Mysuru", "Mysore"] },
  { city: "Mangaluru", names: ["Mangaluru", "Mangalore"] },
  { city: "Hubballi", names: ["Hubballi", "Hubli"] },
  { city: "Belagavi", names: ["Belagavi", "Belgaum"] },
  { city: "Gurugram", names: ["Gurugram", "Gurgaon"] },
  { city: "Kochi", names: ["Kochi", "Cochin"] },
  { city: "Thiruvananthapuram", names: ["Thiruvananthapuram", "Trivandrum"] },
  { city: "Visakhapatnam", names: ["Visakhapatnam", "Vizag"] },
  { city: "Vadodara", names: ["Vadodara", "Baroda"] },
  { city: "Delhi", names: ["Delhi", "New Delhi"] },
];

function cityAliasEvidenceMatches(value, quote) {
  const expected = normaliseAlnum(value);

  const entry = CITY_EVIDENCE_ALIASES.find((item) =>
    item.names.some((name) => normaliseAlnum(name) === expected)
  );

  const aliases = entry ? entry.names : [String(value)];
  const quoteText = String(quote);

  return aliases.some((alias) => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return new RegExp(
      `(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`,
      "iu"
    ).test(quoteText);
  });
}

function evidenceValueAppears(value, quote, field, candidate) {
  if (value === null || value === undefined || !quote) return false;

  const expected = String(value).trim();

  if (
    ["registrationStart", "registrationDeadline", "eventStart", "eventEnd"].includes(
      field
    )
  ) {
    return dateSupportedByText(expected, field, String(quote));
  }

  if (field === "eventName") {
    const quoteAlnum = normaliseAlnum(quote);

    return buildEventNameVariants(candidate.eventName).some((variant) => {
      const variantAlnum = normaliseAlnum(variant);

      return variantAlnum.length >= 6 && quoteAlnum.includes(variantAlnum);
    });
  }

  if (field === "city") {
    return cityAliasEvidenceMatches(expected, quote);
  }

  if (field === "mode") {
    return MODE_PATTERNS[expected.toLowerCase()]?.test(String(quote)) ?? false;
  }

  if (field === "registrationStatus") {
    return (
      REGISTRATION_STATUS_PATTERNS[expected.toLowerCase()]?.test(String(quote)) ??
      false
    );
  }

  return normaliseForMatch(quote).includes(normaliseForMatch(expected));
}

function getEvidenceForField(field, value, evidence, sourceMap, allSources, candidate) {
  if (value === null || value === undefined || value === "") return null;

  const wanted = String(value).trim().toLowerCase();

  return (
    evidence.find((item) => {
      if (item?.field !== field) return false;

      const valueMatches =
        field === "eventName"
          ? true
          : String(item.value ?? "").trim().toLowerCase() === wanted;

      if (!valueMatches) return false;

      const source = getEvidenceSource(item, sourceMap, allSources);

      return (
        source &&
        evidenceValueAppears(
          field === "eventName" ? candidate.eventName : value,
          item.quote,
          field,
          candidate
        )
      );
    }) || null
  );
}

function verifyField(field, value, evidence, sourceMap, allSources, candidate) {
  return getEvidenceForField(field, value, evidence, sourceMap, allSources, candidate)
    ? value
    : null;
}

function isValidISODate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// ---------------------------------------------------------------------------
// REGISTRATION AND INFORMATION URL VERIFICATION
// ---------------------------------------------------------------------------

function verifyRegistrationUrl(value, sources, candidate) {
  const key = urlKey(value);

  if (!key || hostMatches(hostOf(value), SOCIAL_HOSTS)) return null;

  const variants = buildEventNameVariants(candidate.eventName).map(normaliseAlnum);

  for (const source of sources) {
    const content = getSourceContent(source);

    const aboutEvent = variants.some(
      (variant) => variant && normaliseAlnum(content).includes(variant)
    );

    if (!aboutEvent) continue;

    for (const match of extractUrlMatches(content)) {
      if (match.key !== key) continue;

      const context = content.slice(
        Math.max(0, match.index - 300),
        Math.min(content.length, match.index + match.length + 300)
      );

      if (REGISTRATION_WORDS.test(context)) return match.url;
    }
  }

  return null;
}

function verifyInformationUrl(value, sources) {
  const key = urlKey(value);

  if (!key || hostMatches(hostOf(value), SOCIAL_HOSTS)) return null;

  for (const source of sources) {
    if (urlKey(source.url) === key) return canonicalUrl(source.url);

    for (const match of extractUrlMatches(getSourceContent(source))) {
      if (match.key === key) return match.url;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// VALIDATE SARVAM VERIFICATION RESPONSE
// ---------------------------------------------------------------------------

function validateVerificationResponse(candidate, parsed, searchResults) {
  const evidence = Array.isArray(parsed.evidence) ? parsed.evidence : [];
  const sourceMap = buildSourceMap(searchResults);

  const verify = (field, value) =>
    verifyField(field, value, evidence, sourceMap, searchResults, candidate);

  const eventNameEvidence = getEvidenceForField(
    "eventName",
    candidate.eventName,
    evidence,
    sourceMap,
    searchResults,
    candidate
  );

  if (parsed.eventNameMatch !== true || !eventNameEvidence) {
    return {
      verified: false,
      reason: "The event name could not be confirmed by a direct source quotation.",
    };
  }

  const eventPageSource = getEvidenceSource(
    eventNameEvidence,
    sourceMap,
    searchResults
  );

  const eventPageUrl = eventPageSource ? canonicalUrl(eventPageSource.url) : null;

  const dates = {};

  for (const field of [
    "registrationStart",
    "registrationDeadline",
    "eventStart",
    "eventEnd",
  ]) {
    const supported = verify(field, parsed.dates?.[field]);

    dates[field] = supported && isValidISODate(supported) ? supported : null;
  }

  const city = verify("city", parsed.location?.city);
  const venue = verify("venue", parsed.location?.venue);

  const mode = String(verify("mode", parsed.mode) || "").toLowerCase();

  const verifiedMode = ["online", "offline", "hybrid"].includes(mode)
    ? mode
    : "unknown";

  const status = String(
    verify("registrationStatus", parsed.registrationStatus) || ""
  ).toLowerCase();

  const verifiedRegistrationStatus = ["open", "closed", "not_open"].includes(status)
    ? status
    : "unknown";

  const registrationUrl = verifyRegistrationUrl(
    parsed.registrationUrl,
    searchResults,
    candidate
  );

  const officialWebsite = verifyInformationUrl(
    parsed.officialWebsite,
    searchResults
  );

  const verifiedSources = [
    ...new Map(
      [
        ...evidence.map((item) => getEvidenceSource(item, sourceMap, searchResults)),
        eventPageSource,
      ]
        .filter(Boolean)
        .map((source) => [
          urlKey(source.url),
          {
            title: source.title || null,
            url: canonicalUrl(source.url),
            sourceType: classifySource(source.url, candidate),
          },
        ])
    ).values(),
  ];

  const officialSourceFound = verifiedSources.some(
    (source) => source.sourceType === "likely_official"
  );

  const datesVerified = Boolean(dates.eventStart);

  return {
    verified: true,
    event: {
      ...candidate,
      dates,
      location: { city, venue },
      mode: verifiedMode,
      registrationStatus: verifiedRegistrationStatus,
      registrationUrl,
      officialWebsite,
      eventPageUrl,
      eventPageSourceType: eventPageSource
        ? classifySource(eventPageSource.url, candidate)
        : null,
      sources: verifiedSources,
      verification: {
        ...(candidate.verification || {}),
        sourceEvidenceFound: true,
        eventPageFound: Boolean(eventPageUrl),
        officialSourceFound,
        registrationEvidenceFound: Boolean(registrationUrl),
        registrationLinkFound: Boolean(registrationUrl),
        supportingSourceCount: verifiedSources.length,
        confidence: datesVerified
          ? officialSourceFound
            ? "high"
            : "medium"
          : "low",
        notes:
          "Fields were retained only when supported by quotations found in the supplied source pages.",
      },
    },
  };
}

// ---------------------------------------------------------------------------
// CONSERVATIVE LOCAL FALLBACK
// ---------------------------------------------------------------------------

function buildDeterministicNameOnlyFallback(candidate, searchResults) {
  const variants = buildEventNameVariants(candidate.eventName)
    .map(normaliseAlnum)
    .filter((variant) => variant.length >= 6);

  if (!variants.length) return null;

  const matchingSources = searchResults.filter((source) => {
    if (source.pageKind === "listing_page") return false;

    const sourceType = source.sourceType || classifySource(source.url);

    if (sourceType === "third_party_listing") return false;

    const content = normaliseAlnum(getSourceContent(source));

    return variants.some((variant) => content.includes(variant));
  });

  if (!matchingSources.length) return null;

  const verifiedSources = matchingSources.map((source) => ({
    title: source.title || null,
    url: canonicalUrl(source.url),
    sourceType: classifySource(source.url, candidate),
  }));

  const eventPageSource = matchingSources[0];

  return {
    verified: true,
    fallbackUsed: true,
    event: {
      ...candidate,
      dates: {
        registrationStart: null,
        registrationDeadline: null,
        eventStart: null,
        eventEnd: null,
      },
      location: {
        city: null,
        venue: null,
      },
      mode: "unknown",
      registrationStatus: "unknown",
      registrationUrl: null,
      officialWebsite: null,
      eventPageUrl: canonicalUrl(eventPageSource.url),
      eventPageSourceType: classifySource(eventPageSource.url, candidate),
      sources: verifiedSources,
      verification: {
        ...(candidate.verification || {}),
        sourceEvidenceFound: true,
        eventPageFound: true,
        officialSourceFound: false,
        registrationEvidenceFound: false,
        registrationLinkFound: false,
        supportingSourceCount: verifiedSources.length,
        confidence: "low",
        fallbackUsed: true,
        notes:
          "Sarvam verification was unavailable. Only the event name was confirmed directly on a non-listing source. Dates, location, registration details and other fields remain unverified.",
      },
    },
  };
}

// ---------------------------------------------------------------------------
// FIRST-STAGE EVENT EXTRACTION
// ---------------------------------------------------------------------------

export async function extractEventsFromSearch(searchResults) {
  if (!Array.isArray(searchResults) || searchResults.length === 0) {
    return { events: [], extractedCount: 0 };
  }

  console.log("Sending discovery sources to Sarvam...");

  const currentDate = getCurrentIndiaDate();

  const sourceContent = searchResults
    .slice(0, MAX_DISCOVERY_SOURCES)
    .map((item, index) =>
      formatSourceForPrompt(item, index, { withPublished: true })
    )
    .join("\n--------------------\n");

  const userPrompt = `
Today's date in India: ${currentDate}

Extract up to ${MAX_CANDIDATES} genuine student-relevant events.

Prioritize upcoming events. Do not invent or infer details.

For every event:
- Use only sources that explicitly mention that event.
- Do not combine different events.
- Copy URLs exactly.
- Registration URLs require explicit registration evidence.
- Leave unknown dates null.
- Do not claim a source is official without evidence.
- Extract event dates separately from registration dates.
- Look for dates in the entire source, including schedules and lower sections.
- Extract both endpoints of explicitly stated event date ranges.
- Do not use published dates as event dates.

SOURCE MATERIAL:
${sourceContent}

Return the exact JSON structure from the system instructions.
`;

  const aiResponse = await generateSarvamResponse({
    systemPrompt: EVENT_EXTRACTION_PROMPT,
    userPrompt,
    temperature: 0.1,
    maxTokens: 12000,
  });

  console.log("Sarvam model:", aiResponse.model);
  console.log("Sarvam finish reason:", aiResponse.finishReason);
  console.log("Sarvam token usage:", aiResponse.usage);

  if (aiResponse.finishReason === "length") {
    throw new Error("Sarvam response was truncated. Retry with fewer sources.");
  }

  const parsed = parseSarvamJson(aiResponse.content);

  if (!Array.isArray(parsed.events)) {
    throw new Error("Sarvam response is missing its events array");
  }

  const sanitizedEvents = sanitizeEventUrls(parsed.events, searchResults);

  console.log(
    `Extracted ${parsed.events.length} candidates; ${sanitizedEvents.length} have direct discovery-source evidence.`
  );

  return { events: sanitizedEvents, extractedCount: sanitizedEvents.length };
}

// ---------------------------------------------------------------------------
// SECOND-STAGE EVENT VERIFICATION
// ---------------------------------------------------------------------------

export async function verifyEventFromSources(candidate, searchResults) {
  if (
    !candidate?.eventName ||
    !Array.isArray(searchResults) ||
    searchResults.length === 0
  ) {
    return {
      verified: false,
      reason: "Event name or event-specific source material is missing.",
    };
  }

  const currentDate = getCurrentIndiaDate();
  const sources = searchResults.slice(0, MAX_VERIFICATION_SOURCES);

  const sourceContent = sources
    .map((source, index) => formatSourceForPrompt(source, index))
    .join("\n--------------------\n");

  const userPrompt = `
Today's date in India: ${currentDate}

CANDIDATE EVENT:
${JSON.stringify({
    eventName: candidate.eventName,
    organizer: candidate.organizer,
    category: candidate.category,
    location: candidate.location,
  })}

Verify this exact event using only the following sources.

For each non-null field:
- Provide a quotation copied exactly from a source.
- Include the exact source URL.
- Do not return a value if its supporting quotation is unavailable.
- Use ISO dates (YYYY-MM-DD) only when the quotation itself contains the day, month and year.
- If the event edition/year is ambiguous, return null for its dates.
- Inspect the entire supplied source content for date ranges.
- If the source says November 21-22, 2026, verify November 21 as eventStart and November 22 as eventEnd.
- Do not use a registration deadline as an event date.
- Never infer a missing year or use a different edition's dates.
- Do not treat a registration link for another edition as valid.
- Do not claim a source is official; use the Source type label provided.
- For a city, copy the city name from the quotation exactly. Do not canonicalise or rename it.
- The city quotation must identify the event location, not an unrelated mention.

SOURCE MATERIAL:
${sourceContent}

Return the exact JSON structure from the system instructions.
`;

  try {
    const aiResponse = await generateSarvamResponse({
      systemPrompt: EVENT_VERIFICATION_PROMPT,
      userPrompt,
      temperature: 0.1,
      maxTokens: 5000,
    });

    if (aiResponse.finishReason === "length") {
      const fallback = buildDeterministicNameOnlyFallback(candidate, sources);

      if (fallback) {
        console.warn(
          `⚠️ Using conservative name-only verification fallback for ${candidate.eventName}`
        );

        return fallback;
      }

      return {
        verified: false,
        reason: "The verification response was truncated.",
      };
    }

    const parsed = parseSarvamJson(aiResponse.content);
    const result = validateVerificationResponse(candidate, parsed, sources);

    if (result.verified) return result;

    return result;
  } catch (error) {
    console.error(
      `Event verification extraction failed for ${candidate.eventName}:`,
      error.message
    );

    const fallback = buildDeterministicNameOnlyFallback(candidate, sources);

    if (fallback) {
      console.warn(
        `⚠️ Using conservative name-only verification fallback for ${candidate.eventName}`
      );

      return fallback;
    }

    return {
      verified: false,
      fallbackUsed: true,
      reason: `Could not verify event fields: ${error.message}`,
    };
  }
}