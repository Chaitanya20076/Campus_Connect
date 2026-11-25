
import { generateSarvamResponse } from "../events/sarvamService.js";
import { discoverEvents } from "../events/eventDiscoveryService.js";

import { getEventByCCID } from "../events/eventStore.js";

import { CAMPUSCONNECT_SYSTEM_PROMPT } from "./chatbotPrompt.js";

const CCID_REGEX = /\bCC-\d{4}-[A-F0-9]{8}\b/gi;

// Extract unique CCIDs from text.
function extractCCIDs(text) {
  return [
    ...new Set(
      (text.match(CCID_REGEX) || []).map((ccid) =>
        ccid.toUpperCase()
      )
    ),
  ];
}

// Detect requests that need live event discovery.
function isEventSearchRequest(message) {
  const patterns = [
    /\b(find|search|discover|show|list|explore|recommend)\b.*\b(events?|hackathons?|workshops?|competitions?|fests?|conferences?|seminars?|webinars?)\b/i,
    /\b(upcoming|ongoing|latest|current|recent)\b.*\b(events?|hackathons?|workshops?|competitions?|fests?)\b/i,
    /\b(events?|hackathons?|workshops?|competitions?)\b.*\b(in|near|around|at)\b/i,
    /\b(any|some)\b.*\b(hackathons?|events?|workshops?|competitions?)\b/i,
  ];

  return patterns.some((pattern) => pattern.test(message));
}

// Detect upcoming event requests.
function isUpcomingRequest(message) {
  return /\b(upcoming|future|coming soon|yet to happen|not happened yet)\b/i.test(
    message
  );
}

// Detect ongoing event requests.
function isOngoingRequest(message) {
  return /\b(ongoing|happening now|currently happening|live events?)\b/i.test(
    message
  );
}

// Detect follow-up questions.
function isEventFollowUp(message) {
  return /\b(which one|which event|the first|the second|the third|that event|this event|those events|these events|highest prize|lowest prize|compare them|compare these|both events|their eligibility|its eligibility|its deadline|that one|its prize|their prizes|registration deadline)\b/i.test(
    message
  );
}

// Resolve only the exact CCIDs mentioned in conversation history.
function resolveHistoryEvents(history) {
  const requestedCCIDs = new Set();

  for (const item of history) {
    const matches = extractCCIDs(item.content);

    for (const ccid of matches) {
      requestedCCIDs.add(ccid);
    }
  }

  const events = [];
  const missingCCIDs = [];

  for (const ccid of requestedCCIDs) {
    const event = getEventByCCID(ccid);

    if (event) {
      events.push(event);
    } else {
      missingCCIDs.push(ccid);
    }
  }

  return {
    events,
    requestedCCIDs: Array.from(requestedCCIDs),
    missingCCIDs,
  };
}

// Remove duplicate events based on CCID.
function uniqueEvents(events) {
  const unique = new Map();

  for (const event of events) {
    if (event?.ccid) {
      unique.set(event.ccid.toUpperCase(), event);
    }
  }

  return Array.from(unique.values());
}

// Safely parse Sarvam's JSON response.
function parseChatbotResponse(content) {
  try {
    const cleaned = content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (
      typeof parsed.reply !== "string" ||
      !Array.isArray(parsed.suggestedQuestions) ||
      !Array.isArray(parsed.events)
    ) {
      throw new Error("Invalid chatbot response structure");
    }

    return parsed;
  } catch (error) {
    console.error("Chatbot JSON parsing error:", error.message);
    console.error("Raw response:", content.slice(0, 2000));

    throw new Error("The AI assistant returned an invalid response");
  }
}

// Return a deterministic response when an exact event cannot be retrieved.
function unavailableEventResponse(ccids, contextType) {
  const referenceText = ccids.join(", ");

  return {
    success: true,
    contextType,
    reply:
      `I couldn't retrieve the exact event record for ${referenceText}. ` +
      "I won't substitute another event because that could give you incorrect information. " +
      "Please search for the event again or provide a valid CCID.",
    suggestedQuestions: [
      "Can you search for this event again?",
      "Can I find the event using its name?",
      "How do I get an event's CCID?",
    ],
    events: [],
  };
}

// Main CampusConnect chatbot service.
export async function chatWithCampusConnect({
  message,
  conversationHistory = [],
}) {
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new Error("Please enter a message");
  }

  const userMessage = message.trim();

  console.log("💬 Chatbot request:", userMessage);

  // 1. Sanitize conversation history.
  const safeHistory = Array.isArray(conversationHistory)
    ? conversationHistory
        .filter(
          (item) =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string"
        )
        .slice(-10)
        .map((item) => ({
          role: item.role,
          content: item.content.slice(0, 2000),
        }))
    : [];

  let eventContext = [];
  let contextType = "general";
  let filteringApplied = "none";
  let missingHistoryCCIDs = [];

  // 2. Check whether the current message contains CCIDs.
  const currentCCIDs = extractCCIDs(userMessage);

  if (currentCCIDs.length > 0) {
    contextType = "ccid_lookup";

    const resolved = resolveHistoryEvents(
      [{ role: "user", content: userMessage }]
    );

    eventContext = resolved.events;

    if (resolved.missingCCIDs.length > 0) {
      return unavailableEventResponse(
        resolved.missingCCIDs,
        contextType
      );
    }

    console.log("🎯 Retrieved exact CCIDs:", currentCCIDs);
  }

  // 3. Perform live event discovery.
  else if (isEventSearchRequest(userMessage)) {
    contextType = "live_event_search";

    console.log("🔎 Starting chatbot event discovery");

    const discoveryResult = await discoverEvents({
      query: userMessage,
      maxResults: 5,
      includeImages: false,
    });

    eventContext = discoveryResult.events || [];

    if (isUpcomingRequest(userMessage)) {
      eventContext = eventContext.filter(
        (event) => event.status === "upcoming"
      );

      filteringApplied = "upcoming_only";
    } else if (isOngoingRequest(userMessage)) {
      eventContext = eventContext.filter(
        (event) => event.status === "ongoing"
      );

      filteringApplied = "ongoing_only";
    }

    console.log(
      `✅ Relevant events after filtering: ${eventContext.length}`
    );
  }

  // 4. Handle follow-up questions using exact conversation references.
  else if (isEventFollowUp(userMessage)) {
    contextType = "event_follow_up";

    const resolved = resolveHistoryEvents(safeHistory);

    eventContext = uniqueEvents(resolved.events);
    missingHistoryCCIDs = resolved.missingCCIDs;

    console.log(
      `🧠 Restored ${eventContext.length} exact event records`
    );

    // If the conversation mentioned CCIDs but none can be retrieved,
    // never silently replace them with other stored events.
    if (
      resolved.requestedCCIDs.length > 0 &&
      eventContext.length === 0
    ) {
      return unavailableEventResponse(
        resolved.missingCCIDs,
        contextType
      );
    }

    // If there was no identifiable event reference, ask for one.
    if (resolved.requestedCCIDs.length === 0) {
      return {
        success: true,
        contextType,
        reply:
          "I need the exact event reference to answer this accurately. " +
          "Please share the event's CCID or search for the event again.",
        suggestedQuestions: [
          "Can you search for the event again?",
          "How can I find an event using its name?",
        ],
        events: [],
      };
    }
  }

  // 5. Handle ordinary questions.
  else {
    contextType = "general";

    const resolved = resolveHistoryEvents(safeHistory);

    eventContext = resolved.events;
    missingHistoryCCIDs = resolved.missingCCIDs;
  }

  // 6. Build the AI context.
  const userPrompt = `
CURRENT REQUEST TYPE:
${contextType}

EVENT FILTER:
${filteringApplied}

CURRENT DATE:
${new Date().toISOString().slice(0, 10)}

STUDENT MESSAGE:
${userMessage}

RELEVANT EVENT RECORDS:
${JSON.stringify(eventContext, null, 2)}

UNAVAILABLE EVENT REFERENCES:
${JSON.stringify(missingHistoryCCIDs)}

PREVIOUS CONVERSATION:
${JSON.stringify(safeHistory, null, 2)}

IMPORTANT INSTRUCTIONS:

1. Answer the latest student message using the conversation history
   and the supplied event records.

2. If the student refers to "the first", "the second",
   "that event", "which one", or similar phrases, resolve
   the reference using the conversation history and supplied records.

3. Use ONLY the supplied event records for event-specific facts.

4. Never substitute a different event when a referenced CCID
   cannot be found.

5. If an event reference is listed as unavailable, clearly say
   that its exact record could not be retrieved.

6. If the student asks which event has the highest prize,
   compare only events for which prize information is available.

7. Never guess missing prize values.

8. If the student asks for upcoming events, only recommend
   records whose status is "upcoming".

9. If the student asks for ongoing events, only recommend
   records whose status is "ongoing".

10. Do not present completed events as upcoming.

11. Do not present date-unconfirmed events as confirmed upcoming
    events. Explain that their dates need verification.

12. Never invent event details, dates, prizes or registration links.

13. If information is unavailable, say so clearly.

14. Never claim that an event is officially verified unless
    the verification data supports that statement.

15. Return only the exact JSON response format required
    by your system prompt.

16. If no relevant event records are available, return an
    empty events array.

17. Never claim that planned CampusConnect features are already
    operational.

18. If some event references are unavailable but other exact
    event records are available, answer only using the available
    records and clearly disclose the missing references.
`;

  // 7. Generate the chatbot response.
  const aiResponse = await generateSarvamResponse({
    systemPrompt: CAMPUSCONNECT_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.2,
    maxTokens: 4000,
  });

  console.log("🤖 Chatbot model:", aiResponse.model);
  console.log("🏁 Finish reason:", aiResponse.finishReason);

  if (aiResponse.finishReason === "length") {
    throw new Error(
      "The chatbot response was truncated. Please try again."
    );
  }

  const parsedResponse = parseChatbotResponse(aiResponse.content);

  return {
    success: true,
    contextType,
    reply: parsedResponse.reply,
    suggestedQuestions: parsedResponse.suggestedQuestions,
    events: parsedResponse.events,
  };
}
