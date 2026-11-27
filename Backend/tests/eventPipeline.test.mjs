// Offline tests. Tavily and Sarvam are replaced by a scripted fetch() stub and
// every event below is SYNTHETIC (fictional names, *.example.org domains).
// This verifies the pipeline's evidence gates, classification and date logic;
// it does not measure real-world recall or model quality.
import { test, mock } from "node:test";
import assert from "node:assert/strict";

process.env.TAVILY_API_KEY = "test";
process.env.SARVAM_API_KEY = "test";

import { extractIsoDates, dateSupportedByText, buildSourceExcerpt, canonicalUrl }
  from "../services/events/eventEvidenceUtils.js";
import { validateExtractedEvents } from "../services/events/eventValidationService.js";

// "Today" is fixed to 25 Nov 2026 (IST) for deterministic classification.
mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-25T05:00:00Z") });

// ------------------------------------------------------------------ dates
test("Indian and international date formats", () => {
  const cases = [
    ["21st November, 2026", ["2026-11-21"]],
    ["5th – 6th December, 2026", ["2026-12-05", "2026-12-06"]],
    ["November 21-22, 2026", ["2026-11-21", "2026-11-22"]],
    ["21 & 22 Nov 2026", ["2026-11-21", "2026-11-22"]],
    ["30 Nov - 2 Dec 2026", ["2026-11-30", "2026-12-02"]],
    ["Nov 30 – Dec 2, 2026", ["2026-11-30", "2026-12-02"]],
    ["28 Dec - 2 Jan 2027", ["2026-12-28", "2027-01-02"]],
    ["21/11/2026", ["2026-11-21"]],
    ["21.11.2026", ["2026-11-21"]],
    ["Sat, 21st of November 2026", ["2026-11-21"]],
    ["Nov'26 hackathon", []],
    ["21-22 Nov", []], // no year -> never accepted
    ["31 Feb 2026", []], // impossible date
  ];
  for (const [text, expected] of cases) {
    assert.deepEqual(extractIsoDates(text), expected, text);
  }
});

test("registration / publish dates are not accepted as event dates", () => {
  assert.equal(dateSupportedByText("2026-10-24", "eventStart", "Registration deadline: 24 Oct 2026"), false);
  assert.equal(dateSupportedByText("2026-10-24", "registrationDeadline", "Registration deadline: 24 Oct 2026"), true);
  assert.equal(dateSupportedByText("2026-10-01", "eventStart", "Published on 1 Oct 2026"), false);
  assert.equal(dateSupportedByText("2026-11-21", "eventStart", "Register by 24 Oct 2026; event on 21 Nov 2026"), true);
});

test("excerpt keeps dates that sit far down a long page", () => {
  const raw = "nav ".repeat(6000) + "\nWhen: 5th - 6th December, 2026\n" + "footer ".repeat(3000);
  const { raw: excerpt } = buildSourceExcerpt({ rawContent: raw, content: "" });
  assert.ok(excerpt.includes("5th - 6th December, 2026"));
  assert.ok(excerpt.length < 6500);
});

test("URL casing is preserved", () => {
  assert.equal(canonicalUrl("https://Forms.Example.com/AbCdEf123)."), "https://forms.example.com/AbCdEf123");
});

// ----------------------------------------------------- status separation
test("status logic keeps event and registration status separate", () => {
  const run = (dates, extra = {}) =>
    validateExtractedEvents([{ eventName: "X Demo Event", dates, ...extra }]).events[0];

  // deadline passed, NO event dates -> not completed, not upcoming
  let e = run({ registrationDeadline: "2026-10-24" });
  assert.equal(e.status, "date_unconfirmed");
  assert.equal(e.registrationStatus, "closed");

  // AI-claimed status is ignored
  e = run({}, { status: "completed", registrationStatus: "open" });
  assert.equal(e.status, "date_unconfirmed");

  // start in the past, no end -> NOT "ongoing"
  e = run({ eventStart: "2026-11-10" });
  assert.equal(e.status, "date_unconfirmed");
  assert.match(e.statusReason, /no end date/);

  e = run({ eventStart: "2026-11-29", eventEnd: "2026-11-30" });
  assert.equal(e.status, "upcoming");
  e = run({ eventStart: "2026-11-20", eventEnd: "2026-11-21" });
  assert.equal(e.status, "completed");
  e = run({ eventStart: "2026-11-24", eventEnd: "2026-11-26" });
  assert.equal(e.status, "ongoing");

  // city normalisation
  e = run({}, { location: { city: "Bengaluru, Karnataka" } });
  assert.equal(e.location.city, "Bengaluru");
});

// ------------------------------------------------------ full pipeline run
const FILLER = "Navigation menu item. ".repeat(700);

const PAGES = {
  hackblr: {
    url: "https://hackblr-demo.example.org/2026",
    title: "HackBLR Demo 5.0 - Student Hackathon, Bengaluru",
    content: "HackBLR Demo 5.0 is a 24-hour student hackathon.",
    raw: `# HackBLR Demo 5.0\n\nOrganised by Demo Developers Club.\n${FILLER}\n**When:** 5th – 6th December, 2026\n**Where:** Demo Institute of Technology, Bengaluru, Karnataka\n\nRegistrations are open till 30 November 2026.\n\n[Register Here](https://Forms.Example.com/AbCdEf123)\n`,
  },
  listing: {
    url: "https://listing-demo.example.org/events/discover",
    title: "Discover hackathons - event listing",
    content: "Upcoming hackathon events",
    raw: "BuildFest Demo 2.0 hackathon - 12 Dec 2026 - Bengaluru\nOther hackathon events...",
  },
  codesprint: {
    url: "https://unstop.com/hackathons/codesprint-demo-3-0-12345",
    title: "CodeSprint Demo 3.0 hackathon",
    content: "CodeSprint Demo 3.0 registration",
    raw: "CodeSprint Demo 3.0\nRegistration deadline: 24 Oct 2026\nEvent dates: to be announced\nVenue: Bengaluru\n",
  },
  bighack: {
    url: "https://bighack-demo.example.org/",
    title: "THE BIG HACK Demo 2.0 hackathon",
    content: "THE BIG HACK Demo 2.0 hackathon",
    raw: "THE BIG HACK Demo 2.0 will be held 20-21 November 2026 in Bengaluru.",
  },
  legacy: {
    url: "https://legacy-meetup.example.org/",
    title: "Legacy Demo Meetup event",
    content: "Legacy Demo Meetup event",
    raw: "Legacy Demo Meetup starts Nov 10, 2026 in Bengaluru.",
  },
  pune: {
    url: "https://punehack-demo.example.org/",
    title: "Pune Demo Hack 1.0 hackathon",
    content: "Pune Demo Hack 1.0 hackathon",
    raw: "Pune Demo Hack 1.0 takes place 14-15 December 2026 at Demo College, Pune.",
  },
  ecity: {
    url: "https://ecity-demo.example.org/",
    title: "Electronic City Demo Summit event",
    content: "Electronic City Demo Summit event",
    raw: "Electronic City Demo Summit on 15 December 2026. Venue: Demo Campus, Electronic City Phase 1.",
  },
  fixListing: {
    url: "https://allevents.in/bangalore/fix-demo-buildathon",
    title: "Fix Demo Buildathon: Acme x Club",
    content: "Fix Demo Buildathon: Acme x Club hackathon in Bengaluru. Dates on organiser page.",
    raw: "Fix Demo Buildathon: Acme x Club - Bengaluru buildathon event.",
  },
  fixOfficial: {
    url: "https://fixdemobuildathon.example.org/",
    title: "Fix Demo Buildathon",
    content: "Fix Demo Buildathon event",
    raw: "Fix Demo Buildathon\nDates: 29-30 Nov 2026\nVenue: Demo Hub, Bengaluru\n",
  },
  ghost: {
    url: "https://ghost-demo.example.org/",
    title: "Ghost Demo Hack 1.0 hackathon",
    content: "Ghost Demo Hack 1.0 hackathon",
    raw: "Ghost Demo Hack 1.0 is coming soon in Bengaluru.",
  },
  wide: {
    url: "https://widerange-demo.example.org/",
    title: "Wide Range Demo Fest 3.0 fest",
    content: "Wide Range Demo Fest 3.0 fest",
    raw: "Wide Range Demo Fest 3.0: 30 Nov - 2 Dec 2026, Bengaluru.",
  },
};

const toTavily = (p) => ({ title: p.title, url: p.url, content: p.content, raw_content: p.raw, score: 0.8 });

const DISCOVERY_A = ["hackblr", "listing", "codesprint", "bighack", "legacy", "pune", "ecity", "ghost", "wide"];
const DISCOVERY_B = ["codesprint", "fixListing"];
const DETAIL = { "Fix Demo Buildathon": ["fixListing", "fixOfficial"] };

const ev = (field, value, quote, url) => ({ field, value, quote, sourceUrl: url });

const VERIFY = {
  "HackBLR Demo 5.0": (u) => ({
    eventNameMatch: true,
    dates: { registrationStart: null, registrationDeadline: "2026-11-30", eventStart: "2026-12-05", eventEnd: "2026-12-06" },
    location: { city: "Bengaluru", venue: "Demo Institute of Technology, Bengaluru, Karnataka" },
    mode: null, registrationStatus: "open",
    registrationUrl: "https://Forms.Example.com/AbCdEf123", officialWebsite: null,
    evidence: [
      ev("eventName", "HackBLR Demo 5.0", "# HackBLR Demo 5.0", u),
      ev("eventStart", "2026-12-05", "**When:** 5th – 6th December, 2026", u),
      ev("eventEnd", "2026-12-06", "**When:** 5th – 6th December, 2026", u),
      ev("registrationDeadline", "2026-11-30", "Registrations are open till 30 November 2026.", u),
      ev("registrationStatus", "open", "Registrations are open till 30 November 2026.", u),
      ev("city", "Bengaluru", "**Where:** Demo Institute of Technology, Bengaluru, Karnataka", u),
      ev("venue", "Demo Institute of Technology, Bengaluru, Karnataka", "**Where:** Demo Institute of Technology, Bengaluru, Karnataka", u),
    ],
  }),
  "CodeSprint Demo 3.0": (u) => ({
    eventNameMatch: true,
    // CHEAT 1: registration deadline passed off as event start
    // CHEAT 2: fabricated registration URL
    dates: { registrationDeadline: "2026-10-24", eventStart: "2026-10-24" },
    location: { city: "Bengaluru" },
    registrationUrl: "https://unstop.com/fabricated-register", officialWebsite: null,
    evidence: [
      ev("eventName", "CodeSprint Demo 3.0", "CodeSprint Demo 3.0", u),
      ev("registrationDeadline", "2026-10-24", "Registration deadline: 24 Oct 2026", u),
      ev("eventStart", "2026-10-24", "Registration deadline: 24 Oct 2026", u),
      ev("city", "Bengaluru", "Venue: Bengaluru", u),
    ],
  }),
  "THE BIG HACK Demo 2.0": (u) => ({
    eventNameMatch: true,
    dates: { eventStart: "2026-11-20", eventEnd: "2026-11-21" },
    location: { city: "Bengaluru" },
    evidence: [
      ev("eventName", "THE BIG HACK Demo 2.0", "THE BIG HACK Demo 2.0 will be held 20-21 November 2026", u),
      ev("eventStart", "2026-11-20", "will be held 20-21 November 2026 in Bengaluru", u),
      ev("eventEnd", "2026-11-21", "will be held 20-21 November 2026 in Bengaluru", u),
      ev("city", "Bengaluru", "20-21 November 2026 in Bengaluru", u),
    ],
  }),
  "Legacy Demo Meetup": (u) => ({
    eventNameMatch: true,
    dates: { eventStart: "2026-11-10" },
    location: { city: "Bengaluru" },
    evidence: [
      ev("eventName", "Legacy Demo Meetup", "Legacy Demo Meetup starts Nov 10, 2026", u),
      ev("eventStart", "2026-11-10", "Legacy Demo Meetup starts Nov 10, 2026", u),
      ev("city", "Bengaluru", "Nov 10, 2026 in Bengaluru", u),
    ],
  }),
  "Pune Demo Hack 1.0": (u) => ({
    eventNameMatch: true,
    dates: { eventStart: "2026-12-14", eventEnd: "2026-12-15" },
    location: { city: "Pune", venue: "Demo College, Pune" },
    evidence: [
      ev("eventName", "Pune Demo Hack 1.0", "Pune Demo Hack 1.0 takes place", u),
      ev("eventStart", "2026-12-14", "takes place 14-15 December 2026", u),
      ev("eventEnd", "2026-12-15", "takes place 14-15 December 2026", u),
      ev("city", "Pune", "at Demo College, Pune", u),
    ],
  }),
  "Electronic City Demo Summit": (u) => ({
    eventNameMatch: true,
    dates: { eventStart: "2026-12-15", eventEnd: "2026-12-15" },
    location: { city: null, venue: "Demo Campus, Electronic City Phase 1" },
    evidence: [
      ev("eventName", "Electronic City Demo Summit", "Electronic City Demo Summit on 15 December 2026", u),
      ev("eventStart", "2026-12-15", "Electronic City Demo Summit on 15 December 2026", u),
      ev("eventEnd", "2026-12-15", "Electronic City Demo Summit on 15 December 2026", u),
      ev("venue", "Demo Campus, Electronic City Phase 1", "Venue: Demo Campus, Electronic City Phase 1", u),
    ],
  }),
  // Multi-source: name from the listing, dates from the organiser's own page.
  "Fix Demo Buildathon: Acme x Club": (_u, urls) => ({
    eventNameMatch: true,
    dates: { eventStart: "2026-11-29", eventEnd: "2026-11-30" },
    location: { city: "Bengaluru", venue: "Demo Hub, Bengaluru" },
    evidence: [
      ev("eventName", "Fix Demo Buildathon: Acme x Club", "Fix Demo Buildathon: Acme x Club", urls.fixListing),
      ev("eventStart", "2026-11-29", "Dates: 29-30 Nov 2026", urls.fixOfficial),
      ev("eventEnd", "2026-11-30", "Dates: 29-30 Nov 2026", urls.fixOfficial),
      ev("city", "Bengaluru", "Venue: Demo Hub, Bengaluru", urls.fixOfficial),
      ev("venue", "Demo Hub, Bengaluru", "Venue: Demo Hub, Bengaluru", urls.fixOfficial),
    ],
  }),
  // CHEAT 3: date with a quotation that does not exist in any source
  "Ghost Demo Hack 1.0": (u) => ({
    eventNameMatch: true,
    dates: { eventStart: "2026-12-20", eventEnd: "2026-12-20" },
    location: { city: "Bengaluru" },
    evidence: [
      ev("eventName", "Ghost Demo Hack 1.0", "Ghost Demo Hack 1.0 is coming soon in Bengaluru", u),
      ev("eventStart", "2026-12-20", "Ghost Demo Hack 1.0 on 20 December 2026", u),
      ev("eventEnd", "2026-12-20", "Ghost Demo Hack 1.0 on 20 December 2026", u),
      ev("city", "Bengaluru", "coming soon in Bengaluru", u),
    ],
  }),
  "Wide Range Demo Fest 3.0": (u) => ({
    eventNameMatch: true,
    dates: { eventStart: "2026-11-30", eventEnd: "2026-12-02" },
    location: { city: "Bengaluru" },
    evidence: [
      ev("eventName", "Wide Range Demo Fest 3.0", "Wide Range Demo Fest 3.0: 30 Nov - 2 Dec 2026", u),
      ev("eventStart", "2026-11-30", "30 Nov - 2 Dec 2026", u),
      ev("eventEnd", "2026-12-02", "30 Nov - 2 Dec 2026", u),
      ev("city", "Bengaluru", "2 Dec 2026, Bengaluru", u),
    ],
  }),
};

const CANDIDATES = [
  ["HackBLR Demo 5.0", "hackblr", "https://Forms.Example.com/AbCdEf123"],
  ["BuildFest Demo 2.0", "listing"],
  ["CodeSprint Demo 3.0", "codesprint", "https://unstop.com/fabricated-register"],
  ["THE BIG HACK Demo 2.0", "bighack"],
  ["Legacy Demo Meetup", "legacy"],
  ["Pune Demo Hack 1.0", "pune"],
  ["Electronic City Demo Summit", "ecity"],
  ["Fix Demo Buildathon: Acme x Club", "fixListing"],
  ["Ghost Demo Hack 1.0", "ghost"],
  ["Wide Range Demo Fest 3.0", "wide"],
].map(([eventName, page, registrationUrl]) => ({
  eventName,
  category: "hackathon",
  organizer: null,
  location: { city: null, venue: null },
  dates: {},
  registrationUrl: registrationUrl || null,
  sources: [{ title: PAGES[page].title, url: PAGES[page].url }],
  verification: { confidence: "low" },
}));

const calls = { tavily: [], sarvam: 0 };

function installFetchStub() {
  const urls = Object.fromEntries(Object.entries(PAGES).map(([k, v]) => [k, v.url]));
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    const json = (data) => ({ ok: true, status: 200, json: async () => data });

    if (String(url).includes("tavily")) {
      calls.tavily.push({ query: body.query, domains: body.include_domains?.length || 0 });
      let keys;
      const detailKey = Object.keys(DETAIL).find((name) => body.query.includes(name.split(":")[0]));
      if (detailKey) keys = DETAIL[detailKey];
      else if (/AI hackathons/.test(body.query)) keys = body.include_domains ? DISCOVERY_B : DISCOVERY_A;
      else keys = [];
      return json({ results: keys.map((k) => toTavily(PAGES[k])) });
    }

    calls.sarvam += 1;
    const system = body.messages[0].content;
    const user = body.messages[1].content;

    if (/extraction engine/.test(system)) {
      return json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify({ events: CANDIDATES }) } }], model: "stub" });
    }

    const candidate = JSON.parse(user.match(/CANDIDATE EVENT:\n(.*)\n/)[1]);
    const build = VERIFY[candidate.eventName];
    assert.ok(build, `no scripted verification for ${candidate.eventName}`);
    const own = Object.values(PAGES).find((p) => user.includes(`URL: ${p.url}`) && p.title.includes(candidate.eventName.split(":")[0]))?.url;
    return json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(build(own, urls)) } }], model: "stub" });
  };
}

test("end-to-end discovery with scripted Tavily/Sarvam", async () => {
  installFetchStub();
  const { discoverEvents } = await import("../services/events/eventDiscoveryService.js");

  const result = await discoverEvents({ query: "AI hackathons in Bengaluru", maxResults: 10, includeImages: false });
  const g = result.eventGroups;
  const name = (list) => list.map((e) => e.eventName);
  const find = (list, n) => list.find((e) => e.eventName === n);

  console.log("\n--- statistics ---\n" + JSON.stringify(result.statistics, null, 2));
  console.log("--- groups ---");
  for (const [k, v] of Object.entries(g)) console.log(k.padEnd(22), JSON.stringify(v.map((e) => `${e.eventName} [${e.status}/${e.registrationStatus}] ${e.dates.eventStart || "-"}..${e.dates.eventEnd || "-"}`)));
  console.log("--- rejected ---\n" + JSON.stringify(result.rejectedEvents, null, 1));
  console.log("--- tavily calls ---\n" + JSON.stringify(calls.tavily, null, 1));

  // actionable: only events with verified FUTURE dates
  assert.deepEqual(name(g.actionable).sort(), ["Fix Demo Buildathon: Acme x Club", "HackBLR Demo 5.0", "Wide Range Demo Fest 3.0"]);
  for (const e of g.actionable) assert.ok(["upcoming", "ongoing"].includes(e.status) && e.dates.eventStart);
  assert.deepEqual(result.events, g.actionable); // backward-compatible list

  // evidence preserved / not fabricated
  const hack = find(g.actionable, "HackBLR Demo 5.0");
  assert.equal(hack.registrationUrl, "https://forms.example.com/AbCdEf123"); // path casing kept
  assert.equal(hack.registrationStatus, "open");
  assert.equal(hack.location.city, "Bengaluru");

  // multi-source evidence combined, official vs third-party distinguished
  const fix = find(g.actionable, "Fix Demo Buildathon: Acme x Club");
  assert.equal(fix.dates.eventStart, "2026-11-29");
  assert.equal(fix.verification.officialSourceFound, true);
  const types = fix.sources.map((s) => s.sourceType).sort();
  assert.deepEqual(types, ["likely_official", "third_party_listing"]);

  const wide = find(g.actionable, "Wide Range Demo Fest 3.0");
  assert.equal(wide.dates.eventEnd, "2026-12-02");

  // completed by event end date, not by registration
  assert.deepEqual(name(g.completed), ["THE BIG HACK Demo 2.0"]);

  // cheats rejected
  const sprint = find(g.dateUnconfirmed, "CodeSprint Demo 3.0");
  assert.equal(sprint.dates.eventStart, null);          // deadline not reused as event date
  assert.equal(sprint.registrationStatus, "closed");     // registration closed...
  assert.equal(sprint.status, "date_unconfirmed");       // ...but event NOT completed
  assert.equal(sprint.registrationUrl, null);            // fabricated URL dropped
  assert.equal(sprint.verification.officialSourceFound, false); // third-party listing

  const ghost = find(g.dateUnconfirmed, "Ghost Demo Hack 1.0");
  assert.equal(ghost.dates.eventStart, null);            // quote not in source

  const legacy = find(g.dateUnconfirmed, "Legacy Demo Meetup");
  assert.equal(legacy.status, "date_unconfirmed");       // past start, no end != ongoing

  // locations
  assert.deepEqual(name(g.locationUnconfirmed), ["Electronic City Demo Summit"]);
  const rejected = Object.fromEntries(result.rejectedEvents.map((r) => [r.eventName, r]));
  assert.match(rejected["Pune Demo Hack 1.0"].reason, /Pune, not bengaluru/);
  assert.match(rejected["BuildFest Demo 2.0"].reason, /No event-specific/); // listing-only: not verified

  // search used short, unquoted queries
  for (const c of calls.tavily) { assert.ok(c.query.length < 200, c.query); assert.ok(!c.query.includes('"')); }
});