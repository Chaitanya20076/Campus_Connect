
function normalise(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]/g, "");
}

function normaliseUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);

    url.hash = "";
    url.search = "";

    return url.hostname
      .toLowerCase()
      .replace(/^www\./, "") + url.pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

function getEventIdentity(event) {
  const name = normalise(event.eventName);
  const organizer = normalise(event.organizer);
  const date = event.dates?.eventStart || "";

  return {
    name,
    organizer,
    date,
    registration: normaliseUrl(event.registrationUrl),
    website: normaliseUrl(event.officialWebsite),
  };
}

function calculateEventScore(event) {
  let score = 0;

  if (event.description) score += 2;
  if (event.organizer) score += 2;
  if (event.dates?.eventStart) score += 2;
  if (event.dates?.registrationDeadline) score += 1;
  if (event.location?.city) score += 1;
  if (event.registrationUrl) score += 3;
  if (event.officialWebsite) score += 3;
  if (event.coverImageUrl) score += 1;
  if (event.sources?.length) score += Math.min(event.sources.length, 3);

  const confidence = event.verification?.confidence;

  if (confidence === "high") score += 3;
  if (confidence === "medium") score += 2;

  return score;
}

function getSourceUrlKeys(event) {
  return new Set(
    (event.sources || [])
      .map((source) => normaliseUrl(source?.url))
      .filter(Boolean)
  );
}

function areDuplicates(first, second) {
  const a = getEventIdentity(first);
  const b = getEventIdentity(second);

  // Event names must match before any URL/date comparison. A shared generic
  // registration form must never merge two differently named events.
  if (!a.name || !b.name || a.name !== b.name) {
    return false;
  }

  // Two explicitly different start dates indicate different editions/events.
  // This check takes priority over matching URLs or organisers.
  if (a.date && b.date && a.date !== b.date) {
    return false;
  }

  // Exact event-specific registration URL match.
  if (
    a.registration &&
    b.registration &&
    a.registration === b.registration
  ) {
    return true;
  }

  // Exact event information page match.
  if (
    a.website &&
    b.website &&
    a.website === b.website
  ) {
    return true;
  }

  // Same event name and same explicitly stated start date.
  if (a.date && b.date && a.date === b.date) {
    return true;
  }

  // If one or both dates are missing, require a shared source URL before
  // merging. Matching names and organisers alone are not enough: they can
  // describe different annual editions of the same event.
  const firstSources = getSourceUrlKeys(first);
  const secondSources = getSourceUrlKeys(second);

  for (const sourceUrl of firstSources) {
    if (secondSources.has(sourceUrl)) return true;
  }

  // Same organiser is supporting evidence, but never sufficient on its own.
  return false;
}

function mergeEventData(existing, incoming) {
  const preferred =
    calculateEventScore(incoming) > calculateEventScore(existing)
      ? incoming
      : existing;

  const secondary = preferred === incoming ? existing : incoming;

  const mergedSources = [
    ...(existing.sources || []),
    ...(incoming.sources || []),
  ];

  const uniqueSources = [
    ...new Map(
      mergedSources
        .filter((source) => source?.url)
        .map((source) => [normaliseUrl(source.url), source])
    ).values(),
  ];

  return {
    ...secondary,
    ...preferred,

    description:
      preferred.description || secondary.description,

    organizer:
      preferred.organizer || secondary.organizer,

    registrationUrl:
      preferred.registrationUrl || secondary.registrationUrl,

    officialWebsite:
      preferred.officialWebsite || secondary.officialWebsite,

    coverImageUrl:
      preferred.coverImageUrl || secondary.coverImageUrl,

    dates: {
      ...secondary.dates,
      ...preferred.dates,
    },

    location: {
      ...secondary.location,
      ...preferred.location,
    },

    sources: uniqueSources,
  };
}

export function deduplicateEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error("Events must be provided as an array");
  }

  const uniqueEvents = [];

  for (const event of events) {
    if (!event?.eventName) continue;

    const duplicateIndex = uniqueEvents.findIndex((existing) =>
      areDuplicates(existing, event)
    );

    if (duplicateIndex === -1) {
      uniqueEvents.push(event);
    } else {
      uniqueEvents[duplicateIndex] = mergeEventData(
        uniqueEvents[duplicateIndex],
        event
      );
    }
  }

  return {
    events: uniqueEvents,
    originalCount: events.length,
    uniqueCount: uniqueEvents.length,
    duplicatesRemoved: events.length - uniqueEvents.length,
  };
}
