// Shared helpers for the event pipeline: URL handling, Indian-format date
// parsing, quote matching, source classification and relevance scoring.
// Nothing in here invents data: every helper only inspects supplied text.

// ---------------------------------------------------------------------------
// Hosts
// ---------------------------------------------------------------------------

export const SOCIAL_HOSTS = [
  "instagram.com",
  "facebook.com",
  "x.com",
  "twitter.com",
  "youtube.com",
  "tiktok.com",
  "reddit.com",
];

export const EVENT_PLATFORM_HOSTS = [
  "unstop.com",
  "dare2compete.com",
  "devfolio.co",
  "devpost.com",
  "hackerearth.com",
  "hack2skill.com",
  "lu.ma",
  "luma.com",
  "konfhub.com",
  "allevents.in",
  "meetup.com",
  "townscript.com",
  "commudle.com",
  "insider.in",
  "dorahacks.io",
  "mlh.io",
  "eventbrite.com",
  "eventbrite.in",
  "hasgeek.com",
  "gdg.community.dev",
  "skillenza.com",
];

const LISTING_PATH_SEGMENTS = [
  "popular",
  "explore",
  "search",
  "find",
  "hashtag",
  "hashtags",
  "tag",
  "tags",
  "topics",
  "discover",
  "category",
  "categories",
  "listing",
  "listings",
];

export function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function hostMatches(host, list) {
  return list.some((entry) => host === entry || host.endsWith(`.${entry}`));
}

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------

export const URL_PATTERN = /https?:\/\/[^\s<>"'\]\)]+/gi;

export function canonicalUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const parsed = new URL(value.trim().replace(/[),.;!?*_\]]+$/g, ""));

    if (!["http:", "https:"].includes(parsed.protocol)) return "";

    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function urlKey(value, { ignoreQuery = false } = {}) {
  const canonical = canonicalUrl(value);

  if (!canonical) return "";

  const parsed = new URL(canonical);

  if (ignoreQuery) parsed.search = "";

  return parsed.toString().replace(/\/+$/, "").toLowerCase();
}

export function extractUrlMatches(text) {
  const matches = [];

  for (const match of String(text || "").matchAll(URL_PATTERN)) {
    const canonical = canonicalUrl(match[0]);

    if (canonical) {
      matches.push({
        url: canonical,
        key: urlKey(canonical),
        index: match.index ?? 0,
        length: match[0].length,
      });
    }
  }

  return matches;
}

// ---------------------------------------------------------------------------
// Listing-page detection
// ---------------------------------------------------------------------------

export function isListingPage(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    const segments = parsed.pathname
      .toLowerCase()
      .replace(/\/+/g, "/")
      .split("/")
      .filter(Boolean);

    // Eventbrite directory pages.
    if (
      (host === "eventbrite.com" || host === "eventbrite.in") &&
      segments[0] === "d"
    ) {
      return true;
    }

    // MLH season event directories.
    if (
      host === "mlh.io" &&
      segments[0] === "seasons" &&
      segments.includes("events")
    ) {
      return true;
    }

    // Dev.events hackathon directories.
    if (
      host === "dev.events" &&
      segments[0] === "hackathons" &&
      segments.length >= 3
    ) {
      return true;
    }

    // IndiaHackathons directory pages.
    if (host === "indiahackathons.com") {
      // Homepage.
      if (segments.length === 0) {
        return true;
      }

      // The site uses locale prefixes such as /en and /hi.
      // A locale root is still a homepage/directory, not an event page.
      // Strip a recognised locale prefix before checking the remaining path.
      const localePrefixes = new Set([
        "en", "hi", "kn", "ta", "te", "mr", "bn", "gu", "ml", "pa", "ur",
      ]);

      const siteSegments = [...segments];

      if (localePrefixes.has(siteSegments[0])) {
        siteSegments.shift();

        // /hi, /en, etc. are language homepages.
        if (siteSegments.length === 0) {
          return true;
        }
      }

      // Category, location and topic directories.
      if (
        siteSegments[0] === "hackathons" ||
        siteSegments[0] === "locations" ||
        siteSegments[0] === "ai-hackathons" ||
        siteSegments[0] === "workshops" ||
        siteSegments[0] === "competitions"
      ) {
        return true;
      }

      // /events is a directory.
      // /events/<slug> is eligible as an individual event page.
      if (siteSegments[0] === "events" && siteSegments.length <= 1) {
        return true;
      }
    }

    // Generic directory and discovery paths.
    return segments.some((segment) =>
      LISTING_PATH_SEGMENTS.includes(segment)
    );
  } catch {
    return true;
  }
}

// ---------------------------------------------------------------------------
// Text normalisation and quote matching
// ---------------------------------------------------------------------------

export function normaliseAlnum(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function normaliseForMatch(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, "$1 $2")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/[*_`~#>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Date parsing
// ---------------------------------------------------------------------------

const MONTH_NUMBERS = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sept: 9, sep: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

const MONTH_ALT =
  "january|february|march|april|may|june|july|august|september|october|november|december|sept|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec";

const M = `(?<![a-z])(${MONTH_ALT})\\.?(?![a-z])`;
const Y = "(20\\d{2})";
const D = "(\\d{1,2})";
const SP = "[\\s,]*";
const RANGE = "\\s*(?:-|to|till|until|through|thru)\\s*";
const PAIR = "\\s*(?:-|&|and|,|to|till|until|through|thru)\\s*";

function makeIso(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);

  if (!(m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;

  const date = new Date(Date.UTC(y, m - 1, d));

  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

export function prepareDateText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/(\d)(?:st|nd|rd|th)\b/g, "$1")
    .replace(/\b(\d{1,2})\s+of\s+/g, "$1 ")
    .replace(/([a-z])['\u2019](\d{2})\b/g, "$1 20$2");
}

function monthOf(name) {
  return MONTH_NUMBERS[name.replace(/\.$/, "")];
}

export function findDateMentions(text) {
  const prepared = prepareDateText(text);
  const mentions = [];

  const add = (iso, index) => {
    if (iso) mentions.push({ iso, index });
  };

  const run = (source, handler) => {
    for (const match of prepared.matchAll(new RegExp(source, "g"))) {
      handler(match, match.index ?? 0);
    }
  };

  // 21-22 November 2026
  run(`(?<!\\d)${D}${PAIR}${D}${SP}${M}${SP}${Y}(?!\\d)`, (m, i) => {
    const month = monthOf(m[3]);
    add(makeIso(m[4], month, m[1]), i);
    add(makeIso(m[4], month, m[2]), i);
  });

  // November 21-22, 2026
  run(`${M}${SP}${D}${PAIR}${D}${SP}${Y}(?!\\d)`, (m, i) => {
    const month = monthOf(m[1]);
    add(makeIso(m[4], month, m[2]), i);
    add(makeIso(m[4], month, m[3]), i);
  });

  // 30 Nov - 2 Dec 2026
  run(`(?<!\\d)${D}${SP}${M}${RANGE}${D}${SP}${M}${SP}${Y}(?!\\d)`, (m, i) => {
    const m1 = monthOf(m[2]);
    const m2 = monthOf(m[4]);
    const startYear = m1 > m2 ? Number(m[5]) - 1 : m[5];
    add(makeIso(startYear, m1, m[1]), i);
    add(makeIso(m[5], m2, m[3]), i);
  });

  // Nov 30 - Dec 2, 2026
  run(`${M}${SP}${D}${RANGE}${M}${SP}${D}${SP}${Y}(?!\\d)`, (m, i) => {
    const m1 = monthOf(m[1]);
    const m2 = monthOf(m[3]);
    const startYear = m1 > m2 ? Number(m[5]) - 1 : m[5];
    add(makeIso(startYear, m1, m[2]), i);
    add(makeIso(m[5], m2, m[4]), i);
  });

  // 21 November 2026
  run(`(?<!\\d)${D}${SP}${M}${SP}${Y}(?!\\d)`, (m, i) => {
    add(makeIso(m[3], monthOf(m[2]), m[1]), i);
  });

  // November 21, 2026
  run(`${M}${SP}${D}${SP}${Y}(?!\\d)`, (m, i) => {
    add(makeIso(m[3], monthOf(m[1]), m[2]), i);
  });

  // 2026-11-21
  run("(?<!\\d)(20\\d{2})-(\\d{2})-(\\d{2})(?!\\d)", (m, i) => {
    add(makeIso(m[1], m[2], m[3]), i);
  });

  // 21/11/2026, 21-11-2026, 21.11.2026
  run("(?<!\\d)(\\d{1,2})[-/.](\\d{1,2})[-/.](20\\d{2})(?!\\d)", (m, i) => {
    add(makeIso(m[3], m[2], m[1]), i);
  });

  return { prepared, mentions };
}

export function extractIsoDates(text) {
  const { mentions } = findDateMentions(text);

  return [...new Set(mentions.map((mention) => mention.iso))].sort();
}

const REGISTRATION_CONTEXT =
  /\b(regist\w*|deadline|last date|apply (?:by|before|till|until)|applications?\s+(?:close|closes|open|opens)|closes?\s+on|closing|enrol\w*|sign[\s-]?up)\b/;

const EVENT_DATE_CUES =
  /\b(event dates?|event on|event date|will be held|takes place|conducted on|main event|grand finale|finale|hackathon on|when)\b/;

const PUBLISH_CONTEXT = /\b(published|posted|updated|last modified|uploaded)\b/;

function contextBefore(prepared, index) {
  const before = prepared.slice(Math.max(0, index - 90), index);
  const parts = before.split(/[;\n|\u2022]|\.\s/);

  return parts[parts.length - 1] || "";
}

export function dateSupportedByText(iso, field, text) {
  const { prepared, mentions } = findDateMentions(text);
  const isEventField = field === "eventStart" || field === "eventEnd";

  return mentions.some((mention) => {
    if (mention.iso !== iso) return false;

    if (!isEventField) return true;

    const context = contextBefore(prepared, mention.index);

    if (PUBLISH_CONTEXT.test(context)) return false;

    if (REGISTRATION_CONTEXT.test(context) && !EVENT_DATE_CUES.test(context)) {
      return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Event names, relevance, excerpts
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "presents", "edition", "season",
]);

export function buildEventNameVariants(eventName) {
  const full = String(eventName || "").trim();

  if (!full) return [];

  const variants = [full];
  const base = full.split(/\s*[:|\u2013\u2014-]\s+/)[0].trim();

  if (base && base !== full && normaliseAlnum(base).length >= 8) {
    variants.push(base);
  }

  return variants;
}

function nameTokens(name) {
  return [
    ...new Set(
      String(name || "")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 3 && !STOPWORDS.has(token))
    ),
  ];
}

function editionMarkers(name) {
  return String(name || "").match(/\b\d+\.\d+\b|\b20\d{2}\b/g) || [];
}

export function scoreSourceRelevance(source, eventName) {
  const haystack = normaliseForMatch(
    `${source.title || ""} ${source.content || ""} ${(source.rawContent || "").slice(0, 80000)}`
  );

  let best = 0;

  for (const variant of buildEventNameVariants(eventName)) {
    const tokens = nameTokens(variant);

    if (!tokens.length) continue;

    const present = tokens.filter((token) => haystack.includes(token)).length;

    best = Math.max(best, present / tokens.length);
  }

  const markers = editionMarkers(eventName);
  const editionOk = markers.every((marker) => haystack.includes(marker));

  return { ratio: best, editionOk };
}

export function rankRelevantSources(
  sources,
  eventName,
  { minRatio = 0.6, max = 6 } = {}
) {
  return sources
    .map((source) => ({ source, ...scoreSourceRelevance(source, eventName) }))
    .filter((item) => item.ratio >= minRatio && item.editionOk)
    .sort(
      (a, b) =>
        b.ratio - a.ratio || (b.source.score ?? 0) - (a.source.score ?? 0)
    )
    .slice(0, max)
    .map((item) => item.source);
}

export function mergeSourcesByUrl(sources) {
  const merged = new Map();

  for (const source of sources) {
    const key = urlKey(source?.url);

    if (!key) continue;

    const existing = merged.get(key);

    if (
      !existing ||
      (source.rawContent || "").length > (existing.rawContent || "").length
    ) {
      merged.set(key, source);
    }
  }

  return [...merged.values()];
}

const HINT_PATTERN = new RegExp(
  `(?:\\b\\d{1,2}(?:st|nd|rd|th)?\\b[^\\n]{0,12}\\b(?:${MONTH_ALT})\\b|\\b(?:${MONTH_ALT})\\b\\.?[^\\n]{0,6}\\d{1,2}\\b|\\b20\\d{2}-\\d{2}-\\d{2}\\b|\\b\\d{1,2}[-/.]\\d{1,2}[-/.]20\\d{2}\\b|\\b(?:registration|register|deadline|venue|schedule|timeline|last date|apply|when|where)\\b)`,
  "gi"
);

export function buildSourceExcerpt(
  source,
  { contentChars = 3000, rawChars = 5000, headChars = 1500, windowChars = 350 } = {}
) {
  const content = (source.content || "").slice(0, contentChars);
  const raw = source.rawContent || "";

  if (raw.length <= rawChars) {
    return { content, raw };
  }

  const intervals = [];

  for (const match of raw.matchAll(HINT_PATTERN)) {
    const index = match.index ?? 0;

    if (index < headChars) continue;

    intervals.push([
      Math.max(headChars, index - Math.floor(windowChars / 2)),
      Math.min(raw.length, index + windowChars),
    ]);
  }

  const merged = [];

  for (const interval of intervals) {
    const last = merged[merged.length - 1];

    if (last && interval[0] <= last[1]) {
      last[1] = Math.max(last[1], interval[1]);
    } else {
      merged.push([...interval]);
    }
  }

  const pieces = [raw.slice(0, headChars)];
  let used = headChars;

  for (const [start, end] of merged) {
    const piece = raw.slice(start, end);

    if (used + piece.length > rawChars) break;

    pieces.push(piece);
    used += piece.length;
  }

  return { content, raw: pieces.join("\n[...]\n") };
}

// ---------------------------------------------------------------------------
// Source classification
// ---------------------------------------------------------------------------

const GENERIC_TLD_LABELS = new Set([
  "com", "in", "org", "net", "co", "ac", "edu", "io", "dev", "app", "xyz",
  "info", "gov", "tech", "club", "ai", "events", "online", "site",
]);

export function classifySource(url, event = {}) {
  const host = hostOf(url);

  if (!host) return "unclassified_website";

  if (hostMatches(host, SOCIAL_HOSTS)) return "social_media";

  if (hostMatches(host, EVENT_PLATFORM_HOSTS)) return "third_party_listing";

  const eventNorm = normaliseAlnum(event.eventName);
  const organizerNorm = normaliseAlnum(event.organizer);
  const baseNorm = normaliseAlnum(buildEventNameVariants(event.eventName).pop());

  const labels = host
    .split(".")
    .filter((label) => !GENERIC_TLD_LABELS.has(label) && label.length >= 5)
    .map(normaliseAlnum);

  for (const label of labels) {
    if (
      (eventNorm && eventNorm.includes(label)) ||
      (baseNorm && baseNorm.length >= 8 && baseNorm.includes(label)) ||
      (organizerNorm && organizerNorm.includes(label)) ||
      (eventNorm.length >= 8 && label.includes(eventNorm))
    ) {
      return "likely_official";
    }
  }

  return "unclassified_website";
}