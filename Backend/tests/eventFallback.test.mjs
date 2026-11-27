
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.SARVAM_API_KEY = "test";

import { verifyEventFromSources } from "../services/events/eventExtractionService.js";

const candidate = {
  eventName: "CampusConnect Demo Hackathon 2026",
  organizer: "CampusConnect Club",
  category: "hackathon",
  location: {
    city: "Bengaluru",
    venue: "Demo Institute",
  },
  dates: {
    eventStart: "2026-12-10",
    eventEnd: "2026-12-11",
  },
  registrationUrl: "https://example.org/register",
  officialWebsite: "https://example.org/event",
  verification: {
    confidence: "high",
  },
};

function createSource(overrides = {}) {
  return {
    title: "CampusConnect Demo Hackathon 2026",
    url: "https://campusconnect-demo.example.org/event",
    content: "CampusConnect Demo Hackathon 2026 is a student hackathon.",
    rawContent:
      "CampusConnect Demo Hackathon 2026 is organised for student developers.",
    sourceType: "unclassified_website",
    pageKind: "event_page",
    ...overrides,
  };
}

async function withFetchStub(stub, callback) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = stub;

  try {
    return await callback();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("Sarvam failure retains only the event name from a genuine source", async () => {
  const source = createSource();

  const result = await withFetchStub(
    async () => ({
      ok: false,
      status: 400,
      json: async () => ({
        message: "Simulated Sarvam failure",
      }),
    }),
    () => verifyEventFromSources(candidate, [source])
  );

  assert.equal(result.verified, true);
  assert.equal(result.fallbackUsed, true);

  const event = result.event;

  assert.equal(event.eventName, candidate.eventName);

  // Dates must not be copied from the unverified candidate.
  assert.equal(event.dates.registrationStart, null);
  assert.equal(event.dates.registrationDeadline, null);
  assert.equal(event.dates.eventStart, null);
  assert.equal(event.dates.eventEnd, null);

  // Location must remain unverified.
  assert.equal(event.location.city, null);
  assert.equal(event.location.venue, null);

  // Other details must remain unverified.
  assert.equal(event.mode, "unknown");
  assert.equal(event.registrationStatus, "unknown");
  assert.equal(event.registrationUrl, null);
  assert.equal(event.officialWebsite, null);

  assert.equal(event.verification.confidence, "low");
  assert.equal(event.verification.fallbackUsed, true);
  assert.equal(event.verification.officialSourceFound, false);
});

test("fallback must reject listing pages", async () => {
  const listingSource = createSource({
    url: "https://events.example.org/listing",
    sourceType: "third_party_listing",
    pageKind: "listing_page",
  });

  const result = await withFetchStub(
    async () => ({
      ok: false,
      status: 400,
      json: async () => ({
        message: "Simulated Sarvam failure",
      }),
    }),
    () => verifyEventFromSources(candidate, [listingSource])
  );

  assert.equal(result.verified, false);
  assert.equal(result.fallbackUsed, true);
  assert.equal(result.event, undefined);
});

test("valid Sarvam response rejecting the event name must not trigger fallback", async () => {
  const source = createSource();

  const result = await withFetchStub(
    async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        model: "test-model",
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                eventNameMatch: false,
                dates: {},
                location: {},
                evidence: [],
              }),
            },
          },
        ],
      }),
    }),
    () => verifyEventFromSources(candidate, [source])
  );

  assert.equal(result.verified, false);
  assert.equal(result.fallbackUsed, undefined);
  assert.match(result.reason, /event name could not be confirmed/i);
});

test("Sarvam failure without a matching event-name source must not verify the event", async () => {
  const unrelatedSource = createSource({
    title: "Unrelated Student Workshop",
    content: "An unrelated workshop for student developers.",
    rawContent: "Join our workshop next month.",
  });

  const result = await withFetchStub(
    async () => ({
      ok: false,
      status: 400,
      json: async () => ({
        message: "Simulated Sarvam failure",
      }),
    }),
    () => verifyEventFromSources(candidate, [unrelatedSource])
  );

  assert.equal(result.verified, false);
  assert.equal(result.fallbackUsed, true);
  assert.equal(result.event, undefined);
});
