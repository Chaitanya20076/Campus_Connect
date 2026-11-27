
import { test } from "node:test";
import assert from "node:assert/strict";

import { deduplicateEvents } from "../utils/eventDeduplication.js";

function createEvent({
  eventName = "Campus Hackathon",
  organizer = "Tech Club",
  eventStart = null,
  registrationUrl = null,
  officialWebsite = null,
  sourceUrl = "https://example.org/event",
} = {}) {
  return {
    eventName,
    organizer,
    dates: {
      eventStart,
      eventEnd: null,
    },
    registrationUrl,
    officialWebsite,
    sources: sourceUrl
      ? [{ title: eventName, url: sourceUrl }]
      : [],
  };
}

test("different event dates must remain separate editions", () => {
  const events = [
    createEvent({
      eventStart: "2026-12-10",
      sourceUrl: "https://example.org/2026",
    }),
    createEvent({
      eventStart: "2027-12-10",
      sourceUrl: "https://example.org/2027",
    }),
  ];

  const result = deduplicateEvents(events);

  assert.equal(result.uniqueCount, 2);
  assert.equal(result.duplicatesRemoved, 0);
});

test("same event name and date with different URLs should merge", () => {
  const events = [
    createEvent({
      eventStart: "2026-12-10",
      sourceUrl: "https://first.example.org/event",
    }),
    createEvent({
      eventStart: "2026-12-10",
      sourceUrl: "https://second.example.org/event",
    }),
  ];

  const result = deduplicateEvents(events);

  assert.equal(result.uniqueCount, 1);
  assert.equal(result.duplicatesRemoved, 1);
  assert.equal(result.events[0].sources.length, 2);
});

test("missing dates without a shared source must remain separate", () => {
  const events = [
    createEvent({
      eventStart: null,
      sourceUrl: "https://first.example.org/event",
    }),
    createEvent({
      eventStart: null,
      sourceUrl: "https://second.example.org/event",
    }),
  ];

  const result = deduplicateEvents(events);

  assert.equal(result.uniqueCount, 2);
  assert.equal(result.duplicatesRemoved, 0);
});

test("missing dates with a shared source URL should merge", () => {
  const events = [
    createEvent({
      eventStart: null,
      sourceUrl: "https://example.org/event",
    }),
    createEvent({
      eventStart: null,
      sourceUrl: "https://example.org/event",
    }),
  ];

  const result = deduplicateEvents(events);

  assert.equal(result.uniqueCount, 1);
  assert.equal(result.duplicatesRemoved, 1);
});

test("different event names must not merge because of a shared registration URL", () => {
  const sharedRegistrationUrl =
    "https://example.org/register";

  const events = [
    createEvent({
      eventName: "AI Hackathon",
      eventStart: "2026-12-10",
      registrationUrl: sharedRegistrationUrl,
    }),
    createEvent({
      eventName: "Web Development Workshop",
      eventStart: "2026-12-10",
      registrationUrl: sharedRegistrationUrl,
    }),
  ];

  const result = deduplicateEvents(events);

  assert.equal(result.uniqueCount, 2);
  assert.equal(result.duplicatesRemoved, 0);
});

test("invalid input must throw an error", () => {
  assert.throws(
    () => deduplicateEvents(null),
    /Events must be provided as an array/
  );
});
