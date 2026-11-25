
import { generateSarvamResponse } from "./sarvamService.js";

const EVENT_EXTRACTION_PROMPT = `
You are CampusConnect's event extraction engine.

Extract genuine student-relevant events from the supplied web sources.

RULES:
- Never invent information.
- Use null when a field is unavailable.
- Use only URLs present in the supplied sources.
- Prefer official registration and organizer links.
- Extract hackathons, workshops, competitions, conferences,
  seminars, fests, webinars and other student events.
- Exclude unrelated results.
- Keep descriptions and verification notes short.
- Return JSON only. No Markdown or explanations.

Return this structure:

{
  "events": [
    {
      "eventName": "string",
      "description": "string or null",
      "category": "hackathon | workshop | competition | conference | seminar | fest | webinar | other",
      "organizer": "string or null",
      "location": "string or null",
      "mode": "online | offline | hybrid | unknown",
      "dates": {
        "registrationStart": "YYYY-MM-DD or null",
        "registrationDeadline": "YYYY-MM-DD or null",
        "eventStart": "YYYY-MM-DD or null",
        "eventEnd": "YYYY-MM-DD or null"
      },
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

Return at most 5 events.
If none are found, return {"events": []}.
`;

function parseSarvamJson(content) {
  try {
    const cleaned = content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed || !Array.isArray(parsed.events)) {
      throw new Error("Missing events array");
    }

    return parsed;

  } catch (error) {
    console.error("❌ Sarvam JSON parsing failed:", error.message);
    console.error("📄 Response preview:");
    console.error(content.slice(-3000));

    throw new Error(
      `Sarvam returned invalid event JSON: ${error.message}`
    );
  }
}

export async function extractEventsFromSearch(searchResults) {
  if (!Array.isArray(searchResults) || searchResults.length === 0) {
    return {
      events: [],
      extractedCount: 0,
    };
  }

  console.log("🤖 Sending search results to Sarvam...");

  const sourceContent = searchResults.slice(0, 5).map((item, index) => {
    return `
SOURCE ${index + 1}
Title: ${item.title || "Unknown"}
URL: ${item.url || "Unavailable"}
Published: ${item.publishedDate || "Unknown"}

Content:
${(item.rawContent || item.content || "").slice(0, 4000)}
`;
  }).join("\n--------------------\n");

  const userPrompt = `
Extract up to 5 relevant events from these sources.

${sourceContent}

Return the requested JSON structure.
Keep every field concise. Do not repeat information unnecessarily.
`;

  const aiResponse = await generateSarvamResponse({
    systemPrompt: EVENT_EXTRACTION_PROMPT,
    userPrompt,
    temperature: 0.1,
    maxTokens: 12000,
  });

  console.log("🤖 Sarvam model:", aiResponse.model);
  console.log("🏁 Finish reason:", aiResponse.finishReason);
  console.log("📊 Token usage:", aiResponse.usage);

  if (aiResponse.finishReason === "length") {
    throw new Error(
      "Sarvam response was truncated by the token limit. Retry with fewer sources."
    );
  }

  const parsed = parseSarvamJson(aiResponse.content);

  console.log(`✅ Extracted ${parsed.events.length} events`);

  return {
    events: parsed.events,
    extractedCount: parsed.events.length,
  };
}
