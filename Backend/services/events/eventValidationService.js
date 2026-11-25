
const ALLOWED_CATEGORIES = [
  "hackathon",
  "workshop",
  "competition",
  "conference",
  "meetup",
  "webinar",
  "other",
];

const ALLOWED_MODES = [
  "online",
  "offline",
  "hybrid",
  "unknown",
];

const ALLOWED_STATUSES = [
  "upcoming",
  "ongoing",
  "completed",
  "date_unconfirmed",
];

function cleanText(value, maxLength = 2000) {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  if (!cleaned) return null;

  return cleaned.slice(0, maxLength);
}

function validateUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const parsed = new URL(value);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function validateDate(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (date.toISOString().slice(0, 10) !== value) {
    return null;
  }

  return value;
}

function validateTeamSize(value) {
  if (!value || typeof value !== "object") {
    return {
      minimum: null,
      maximum: null,
    };
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
    return {
      minimum: null,
      maximum: null,
    };
  }

  return {
    minimum,
    maximum,
  };
}

function validateSources(sources) {
  if (!Array.isArray(sources)) return [];

  return sources
    .map((source) => ({
      title: cleanText(source?.title, 300),
      url: validateUrl(source?.url),
    }))
    .filter((source) => source.url);
}

function validateEvent(event) {
  if (!event || typeof event !== "object") {
    return null;
  }

  const eventName = cleanText(event.eventName, 250);

  if (!eventName) {
    return null;
  }

  const category = ALLOWED_CATEGORIES.includes(
    String(event.category || "").toLowerCase()
  )
    ? String(event.category).toLowerCase()
    : "other";

  const location = event.location || {};
  const dates = event.dates || {};
  const verification = event.verification || {};

  const mode = ALLOWED_MODES.includes(
    String(location.mode || "").toLowerCase()
  )
    ? String(location.mode).toLowerCase()
    : "unknown";

  const sources = validateSources(event.sources);

  const registrationUrl = validateUrl(event.registrationUrl);
  const officialWebsite = validateUrl(event.officialWebsite);
  const coverImageUrl = validateUrl(event.coverImageUrl);

  const validatedDates = {
    registrationStart: validateDate(dates.registrationStart),
    registrationDeadline: validateDate(dates.registrationDeadline),
    eventStart: validateDate(dates.eventStart),
    eventEnd: validateDate(dates.eventEnd),
  };

  const currentDate = new Date().toISOString().slice(0, 10);

  let status = "date_unconfirmed";

  if (validatedDates.eventEnd && validatedDates.eventEnd < currentDate) {
    status = "completed";
  } else if (
    validatedDates.eventStart &&
    validatedDates.eventStart <= currentDate &&
    (!validatedDates.eventEnd || validatedDates.eventEnd >= currentDate)
  ) {
    status = "ongoing";
  } else if (
    validatedDates.eventStart &&
    validatedDates.eventStart > currentDate
  ) {
    status = "upcoming";
  } else if (
    ALLOWED_STATUSES.includes(event.status) &&
    event.status === "completed"
  ) {
    status = "completed";
  }

  const confidence = ["high", "medium", "low"].includes(
    verification.confidence
  )
    ? verification.confidence
    : "low";

  const requiredSkills = Array.isArray(event.requiredSkills)
    ? [...new Set(
        event.requiredSkills
          .filter((skill) => typeof skill === "string")
          .map((skill) => skill.trim())
          .filter(Boolean)
      )].slice(0, 30)
    : [];

  return {
    eventName,
    description: cleanText(event.description, 5000),
    category,
    organizer: cleanText(event.organizer, 250),

    location: {
      city: cleanText(location.city, 150),
      venue: cleanText(location.venue, 300),
      mode,
    },

    dates: validatedDates,

    eligibility: cleanText(event.eligibility, 1500),
    teamSize: validateTeamSize(event.teamSize),
    requiredSkills,
    prizes: cleanText(event.prizes, 1500),

    registrationUrl,
    officialWebsite,
    coverImageUrl,

    sources,

    verification: {
      officialSourceFound: Boolean(verification.officialSourceFound),
      registrationLinkFound: Boolean(registrationUrl),
      confidence,
      notes: cleanText(verification.notes, 1000),
    },

    status,

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
