import { fetchBrabbleListings } from "./brabbleService.js";
import { validateExtractedEvents } from "./eventValidationService.js";
import { deduplicateEvents } from "../../utils/eventDeduplication.js";
import { generateCCID } from "../../utils/generateCCID.js";
import { saveEvents } from "./eventStore.js";

const ccidCache = new Map();

function normalise(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function createEventIdentity(event) {
  return [
    normalise(event.eventName),
    normalise(event.organizer || ""),
    event.dates?.eventStart || event.dates?.registrationDeadline || "",
  ].join("|");
}

function assignCCID(event) {
  const identity = createEventIdentity(event);

  if (!ccidCache.has(identity)) {
    ccidCache.set(identity, generateCCID());
  }

  return { ...event, ccid: ccidCache.get(identity) };
}

function parseTeamSize(team) {
  const value = String(team || "").trim();
  if (!value || /^individual$/i.test(value)) {
    return { minimum: /^individual$/i.test(value) ? 1 : null, maximum: 1 };
  }

  const match = value.match(/(\d+)\s*(?:-|to)\s*(\d+)/i);
  if (match) {
    const minimum = Number(match[1]);
    const maximum = Number(match[2]);
    if (minimum > 0 && maximum >= minimum) return { minimum, maximum };
  }

  const single = value.match(/\d+/);
  if (single) {
    const count = Number(single[0]);
    if (count > 0) return { minimum: count, maximum: count };
  }

  return { minimum: null, maximum: null };
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function normaliseMode(value) {
  const mode = String(value || "").toLowerCase();
  if (mode === "online") return "online";
  if (mode === "offline") return "offline";
  if (mode === "hybrid") return "hybrid";
  return "unknown";
}

function mapBrabbleListing(listing) {
  const kind = String(listing.kind || "").toLowerCase();
  const deadlineDate = toDate(listing.deadline);

  // Brabble's deadline has two different meanings:
  // competition = application deadline; contest = contest start date.
  const registrationDeadline =
    kind === "competition" ? deadlineDate : null;
  const eventStart =
    kind === "contest" ? deadlineDate : null;

  const city = String(listing.city || "").trim();
  const usableCity =
    city && !/^see listing$/i.test(city) ? city : null;

  const organiserUrl =
    typeof listing.url === "string" && /^https?:\/\//i.test(listing.url)
      ? listing.url
      : null;

  const shareUrl =
    typeof listing.shareUrl === "string" && /^https?:\/\//i.test(listing.shareUrl)
      ? listing.shareUrl
      : null;

  const categoryMap = {
    HACKATHON: "hackathon",
    "CASE STUDY": "competition",
    CONTEST: "competition",
    CODING: "competition",
    INNOVATION: "competition",
    DESIGN: "competition",
    COMPETITION: "competition",
    QUIZ: "other",
  };

  const title = String(listing.title || "").trim();

  return {
    eventName: title,
    description: null,
    category: categoryMap[String(listing.type || "").toUpperCase()] || "other",
    organizer: listing.organiser || null,

    location: {
      city: usableCity,
      venue: null,
      mode: normaliseMode(listing.mode),
    },
    mode: normaliseMode(listing.mode),

    dates: {
      registrationStart: null,
      registrationDeadline,
      eventStart,
      eventEnd: null,
    },

    eligibility: Array.isArray(listing.eligibility)
      ? listing.eligibility.filter((item) => typeof item === "string").join("; ")
      : null,

    teamSize: parseTeamSize(listing.team),
    requiredSkills: [],
    prizes: listing.prize?.label && !/^see listing$/i.test(listing.prize.label)
      ? listing.prize.label
      : null,

    registrationUrl: organiserUrl,
    officialWebsite: null,
    eventPageUrl: shareUrl,
    coverImageUrl: null,
    eventPageSourceType: "third_party_listing",

    sources: [
      ...(organiserUrl
        ? [{ title: `${listing.platform || "Organizer"} listing`, url: organiserUrl, sourceType: "third_party_listing" }]
        : []),
      ...(shareUrl
        ? [{ title: "Brabble event listing", url: shareUrl, sourceType: "third_party_listing" }]
        : []),
    ],

    verification: {
      officialSourceFound: false,
      sourceEvidenceFound: Boolean(organiserUrl || shareUrl),
      eventPageFound: Boolean(shareUrl),
      registrationEvidenceFound: Boolean(organiserUrl),
      registrationLinkFound: Boolean(organiserUrl),
      supportingSourceCount: Number(Boolean(organiserUrl)) + Number(Boolean(shareUrl)),
      confidence: "medium",
      notes: `Data supplied by Brabble. Platform: ${listing.platform || "unknown"}. Listing kind: ${kind || "unknown"}. ${kind === "competition" ? "Brabble deadline is the application deadline, not the event date." : kind === "contest" ? "Brabble deadline is the contest start date." : "Date meaning was not specified by Brabble."}`,
    },

    // Brabble-specific fields retained for UI display and traceability.
    brabble: {
      id: listing.id || null,
      kind: kind || null,
      platform: listing.platform || null,
      shareUrl,
      fee: listing.fee || null,
      prizeINR: Number.isFinite(listing.prize?.inr) ? listing.prize.inr : null,
      registered: Number.isInteger(listing.registered) ? listing.registered : null,
      deadline: listing.deadline || null,
      deadlineMeaning: kind === "competition"
        ? "application_deadline"
        : kind === "contest"
          ? "contest_start"
          : "unknown",
    },
  };
}

function sortEvents(events) {
  const priority = { upcoming: 1, ongoing: 2, date_unconfirmed: 3, completed: 4 };

  return [...events].sort((a, b) => {
    const statusDifference =
      (priority[a.status] || 5) - (priority[b.status] || 5);
    if (statusDifference !== 0) return statusDifference;

    return (a.dates?.eventStart || a.dates?.registrationDeadline || "9999-12-31")
      .localeCompare(b.dates?.eventStart || b.dates?.registrationDeadline || "9999-12-31");
  });
}

function createGroups(events) {
  const groups = {
    actionable: [],
    registrationClosed: [],
    registrationNotOpen: [],
    dateUnconfirmed: [],
    completed: [],
  };

  for (const event of events) {
    event.locationStatus =
      !event.location?.city && event.mode !== "online" ? "unconfirmed" : "confirmed";

    if (event.status === "completed") groups.completed.push(event);
    else if (event.status === "date_unconfirmed") groups.dateUnconfirmed.push(event);
    else if (event.registrationStatus === "closed") groups.registrationClosed.push(event);
    else if (event.registrationStatus === "not_open") groups.registrationNotOpen.push(event);
    else groups.actionable.push(event);
  }

  return groups;
}

export async function discoverEvents({
  query = "",
  location = "",
  category = "",
  maxResults = 10,
}) {
  console.log("🚀 Starting CampusConnect event discovery with Brabble...");
  console.log("Search:", query || "All available listings");
  console.log("Location:", location || "Any location");
  console.log("Category:", category || "All categories");

  const brabbleResult = await fetchBrabbleListings({
    query,
    location,
    category,
    maxResults,
  });

  const mappedEvents = brabbleResult.listings.map(mapBrabbleListing);
  const validationResult = validateExtractedEvents(mappedEvents);
  const deduplicationResult = deduplicateEvents(validationResult.events);

  const resultLimit = Math.min(Math.max(Number(maxResults) || 10, 1), 200);
  let finalEvents = sortEvents(deduplicationResult.events)
    .slice(0, resultLimit)
    .map(assignCCID);

  saveEvents(finalEvents);

  const eventGroups = createGroups(finalEvents);
  const rejectedEvents = validationResult.rejectedEvents.map((item) => ({
    ...item,
    stage: "validation",
  }));

  console.log("🎉 Brabble event discovery complete.");
  console.log("Brabble listings:", brabbleResult.returnedResults);
  console.log("Valid events:", validationResult.validCount);
  console.log("Duplicates removed:", deduplicationResult.duplicatesRemoved);
  console.log("Final events:", finalEvents.length);

  return {
    success: true,
    search: {
      provider: "brabble",
      query: brabbleResult.query,
      totalSources: brabbleResult.totalResults,
      usableSources: brabbleResult.returnedResults,
      filteredSources: Math.max(brabbleResult.totalResults - brabbleResult.returnedResults, 0),
      refreshedAt: brabbleResult.refreshedAt,
      origin: brabbleResult.origin,
      rateLimit: brabbleResult.rateLimit,
      attribution: brabbleResult.attribution,
      docs: brabbleResult.docs,
    },
    statistics: {
      extracted: mappedEvents.length,
      valid: validationResult.validCount,
      rejected: rejectedEvents.length,
      duplicatesRemoved: deduplicationResult.duplicatesRemoved,
      finalEvents: finalEvents.length,
    },
    eventGroups,
    rejectedEvents,
    events: finalEvents,
  };
}
