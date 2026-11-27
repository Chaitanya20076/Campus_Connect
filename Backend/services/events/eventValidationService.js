const ALLOWED_CATEGORIES = [
  "hackathon",
  "workshop",
  "competition",
  "conference",
  "seminar",
  "meetup",
  "fest",
  "webinar",
  "other",
];

const ALLOWED_MODES = ["online", "offline", "hybrid", "unknown"];

const ALLOWED_STATUSES = [
  "upcoming",
  "ongoing",
  "completed",
  "date_unconfirmed",
];

const ALLOWED_REGISTRATION_STATUSES = [
  "open",
  "closed",
  "not_open",
  "unknown",
];

function getIndiaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function cleanText(value, maxLength = 2000) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function validateUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const parsed = new URL(value.trim());

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function validateDate(value) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return null;
  }

  const date = new Date(`${cleaned}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10) === cleaned
    ? cleaned
    : null;
}

function validateTeamSize(value) {
  if (!value || typeof value !== "object") {
    return { minimum: null, maximum: null };
  }

  const minimum =
    Number.isInteger(value.minimum) && value.minimum > 0
      ? value.minimum
      : null;

  const maximum =
    Number.isInteger(value.maximum) && value.maximum > 0
      ? value.maximum
      : null;

  if (minimum && maximum && minimum > maximum) {
    return { minimum: null, maximum: null };
  }

  return { minimum, maximum };
}

const ALLOWED_SOURCE_TYPES = [
  "social_media",
  "third_party_listing",
  "likely_official",
  "unclassified_website",
];

function validateSources(sources) {
  if (!Array.isArray(sources)) return [];

  return sources
    .map((source) => {
      if (typeof source === "string") {
        return {
          title: null,
          url: validateUrl(source),
        };
      }

      const mapped = {
        title: cleanText(source?.title, 300),
        url: validateUrl(
          source?.url || source?.sourceUrl || source?.link
        ),
      };

      if (ALLOWED_SOURCE_TYPES.includes(source?.sourceType)) {
        mapped.sourceType = source.sourceType;
      }

      return mapped;
    })
    .filter((source) => source.url);
}

// Determine event status using verified event dates only.
// An AI-supplied status is never sufficient evidence, and neither is a
// registration date. Returns the status plus a human-readable reason.
function determineEventStatus(dates) {
  const today = getIndiaDate();
  const { eventStart, eventEnd } = dates;

  if (eventEnd && eventEnd < today) {
    return {
      status: "completed",
      reason: "The verified event end date is in the past.",
    };
  }

  if (eventStart && eventEnd && eventStart <= today && eventEnd >= today) {
    return {
      status: "ongoing",
      reason: "Today falls within the verified event date range.",
    };
  }

  if (eventStart && !eventEnd && eventStart === today) {
    return {
      status: "ongoing",
      reason: "The event starts today; no end date was verified.",
    };
  }

  if (eventStart && eventStart > today) {
    return {
      status: "upcoming",
      reason: "The verified event start date is in the future.",
    };
  }

  if (eventStart && !eventEnd && eventStart < today) {
    // Previously this was reported as "ongoing" forever. A past start date
    // with no verified end date cannot show whether the event is running,
    // finished, or still ahead (multi-day events), so it stays unconfirmed.
    return {
      status: "date_unconfirmed",
      reason:
        "The verified start date is in the past but no end date was verified, so it is unknown whether the event is still running.",
    };
  }

  if (!eventStart && eventEnd) {
    return {
      status: "date_unconfirmed",
      reason: "Only an event end date was verified; no start date.",
    };
  }

  return {
    status: "date_unconfirmed",
    reason: "No verified event dates were found in the available sources.",
  };
}

function determineRegistrationStatus(
  dates,
  suppliedStatus,
  eventStatus
) {
  const today = getIndiaDate();

  if (eventStatus === "completed") {
    return "closed";
  }

  if (
    dates.registrationDeadline &&
    dates.registrationDeadline < today
  ) {
    return "closed";
  }

  if (
    dates.registrationStart &&
    dates.registrationStart > today
  ) {
    return "not_open";
  }

  if (ALLOWED_REGISTRATION_STATUSES.includes(suppliedStatus)) {
    return suppliedStatus;
  }

  return "unknown";
}

// Recognised Indian city names and their common alternatives.
export const CITY_NAME_PATTERNS = [
  { city: "Bengaluru", names: ["Bengaluru", "Bangalore"] },
  { city: "Mumbai", names: ["Mumbai", "Bombay"] },
  { city: "Chennai", names: ["Chennai", "Madras"] },
  { city: "Kolkata", names: ["Kolkata", "Calcutta"] },
  { city: "Hyderabad", names: ["Hyderabad"] },
  { city: "Pune", names: ["Pune"] },
  { city: "Delhi", names: ["New Delhi", "Delhi"] },
  { city: "Mysuru", names: ["Mysuru", "Mysore"] },
  { city: "Mangaluru", names: ["Mangaluru", "Mangalore"] },
  { city: "Hubballi", names: ["Hubballi", "Hubli"] },
  { city: "Belagavi", names: ["Belagavi", "Belgaum"] },
  { city: "Gurugram", names: ["Gurugram", "Gurgaon"] },
  { city: "Noida", names: ["Noida"] },
  { city: "Ahmedabad", names: ["Ahmedabad"] },
  { city: "Jaipur", names: ["Jaipur"] },
  { city: "Lucknow", names: ["Lucknow"] },
  { city: "Kochi", names: ["Kochi", "Cochin"] },
  { city: "Thiruvananthapuram", names: ["Thiruvananthapuram", "Trivandrum"] },
  { city: "Chandigarh", names: ["Chandigarh"] },
  { city: "Coimbatore", names: ["Coimbatore"] },
  { city: "Indore", names: ["Indore"] },
  { city: "Bhopal", names: ["Bhopal"] },
  { city: "Nagpur", names: ["Nagpur"] },
  { city: "Visakhapatnam", names: ["Visakhapatnam", "Vizag"] },
  { city: "Patna", names: ["Patna"] },
  { city: "Bhubaneswar", names: ["Bhubaneswar"] },
  { city: "Surat", names: ["Surat"] },
  { city: "Vadodara", names: ["Vadodara", "Baroda"] },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Every recognised city explicitly named in the text, in order of appearance.
export function findCitiesInText(text) {
  if (typeof text !== "string" || !text.trim()) return [];

  const found = [];

  for (const entry of CITY_NAME_PATTERNS) {
    for (const name of entry.names) {
      const match = new RegExp(`\\b${escapeRegExp(name)}\\b`, "i").exec(text);

      if (match) {
        found.push({ city: entry.city, index: match.index });
      }
    }
  }

  found.sort((a, b) => a.index - b.index);

  return [...new Set(found.map((item) => item.city))];
}

// Infer a city only when exactly one recognised city is named in the text
// ("Bengaluru, Karnataka" -> Bengaluru). Ambiguous text returns null.
export function inferCityFromVenue(venue) {
  const cities = findCitiesInText(venue);

  return cities.length === 1 ? cities[0] : null;
}

function validateEvent(event) {
  if (!event || typeof event !== "object") {
    return null;
  }

  const eventName = cleanText(event.eventName, 250);

  if (!eventName) return null;

  const rawCategory = String(event.category || "").toLowerCase();

  const category = ALLOWED_CATEGORIES.includes(rawCategory)
    ? rawCategory
    : "other";

  const location = event.location || {};
  const dates = event.dates || {};
  const verification = event.verification || {};

  const rawMode = String(
    location.mode || event.mode || ""
  ).toLowerCase();

  const mode = ALLOWED_MODES.includes(rawMode)
    ? rawMode
    : "unknown";

  const validatedDates = {
    registrationStart: validateDate(dates.registrationStart),
    registrationDeadline: validateDate(dates.registrationDeadline),
    eventStart: validateDate(dates.eventStart),
    eventEnd: validateDate(dates.eventEnd),
  };

  // Remove contradictory event date ranges instead of guessing.
  if (
    validatedDates.eventStart &&
    validatedDates.eventEnd &&
    validatedDates.eventEnd < validatedDates.eventStart
  ) {
    validatedDates.eventStart = null;
    validatedDates.eventEnd = null;
  }

  // Remove contradictory registration date ranges.
  if (
    validatedDates.registrationStart &&
    validatedDates.registrationDeadline &&
    validatedDates.registrationDeadline <
      validatedDates.registrationStart
  ) {
    validatedDates.registrationStart = null;
    validatedDates.registrationDeadline = null;
  }

  const { status, reason: statusReason } =
    determineEventStatus(validatedDates);

  const registrationStatus = determineRegistrationStatus(
    validatedDates,
    event.registrationStatus,
    status
  );

  let registrationUrl = validateUrl(event.registrationUrl);

  // Never expose a registration link when registration is known
  // to be closed or has not opened yet.
  if (
    registrationStatus === "closed" ||
    registrationStatus === "not_open"
  ) {
    registrationUrl = null;
  }

  const confidence = ["high", "medium", "low"].includes(
    verification.confidence
  )
    ? verification.confidence
    : "low";

  const requiredSkills = Array.isArray(event.requiredSkills)
    ? [
        ...new Set(
          event.requiredSkills
            .filter((skill) => typeof skill === "string")
            .map((skill) => skill.trim())
            .filter(Boolean)
        ),
      ].slice(0, 30)
    : [];

  return {
    eventName,
    description: cleanText(event.description, 5000),
    category,
    organizer: cleanText(event.organizer, 250),

    location: {
      // "Bengaluru, Karnataka" / "Bangalore, India" -> "Bengaluru".
      city:
        inferCityFromVenue(location.city) ||
        cleanText(location.city, 150) ||
        inferCityFromVenue(location.venue),

      venue: cleanText(location.venue, 300),
      mode,
    },

    mode,
    dates: validatedDates,

    eligibility: cleanText(event.eligibility, 1500),
    teamSize: validateTeamSize(event.teamSize),
    requiredSkills,
    prizes: cleanText(event.prizes, 1500),

    registrationUrl,
    officialWebsite: validateUrl(event.officialWebsite),
    eventPageUrl: validateUrl(event.eventPageUrl),
    coverImageUrl: validateUrl(event.coverImageUrl),
    eventPageSourceType: ALLOWED_SOURCE_TYPES.includes(
      event.eventPageSourceType
    )
      ? event.eventPageSourceType
      : null,

    sources: validateSources(event.sources),

    verification: {
      officialSourceFound:
        verification.officialSourceFound === true,

      sourceEvidenceFound:
        verification.sourceEvidenceFound === true,

      eventPageFound:
        verification.eventPageFound === true,

      registrationEvidenceFound:
        verification.registrationEvidenceFound === true,

      registrationLinkFound: Boolean(registrationUrl),

      supportingSourceCount:
        Number.isInteger(verification.supportingSourceCount)
          ? verification.supportingSourceCount
          : 0,

      confidence,
      notes: cleanText(verification.notes, 1000),
    },

    status,
    statusReason,
    registrationStatus,

    lastChecked: new Date().toISOString(),
  };
}

export function validateExtractedEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error("Events must be provided as an array");
  }

  const validEvents = [];
  const rejectedEvents = [];

  events.forEach((event, index) => {
    const validated = validateEvent(event);

    if (validated) {
      validEvents.push(validated);
    } else {
      rejectedEvents.push({
        index,
        eventName: event?.eventName || "Unknown event",
        reason: "Missing or invalid event name",
      });
    }
  });

  return {
    events: validEvents,
    rejectedEvents,
    validCount: validEvents.length,
    rejectedCount: rejectedEvents.length,
  };
}