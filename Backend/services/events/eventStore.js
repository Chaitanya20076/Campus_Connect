
const MAX_STORED_EVENTS = 200;

const eventStore = new Map();

/**
 * Save events in temporary memory.
 * Recently updated events move to the latest position.
 */
export function saveEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error("Events must be an array");
  }

  for (const event of events) {
    if (!event.ccid) {
      console.warn("Skipping event without CCID:", event.eventName);
      continue;
    }

    const ccid = event.ccid.toUpperCase();

    // Move updated events to the latest position.
    eventStore.delete(ccid);

    eventStore.set(ccid, {
      ...event,
      ccid,
      storedAt: new Date().toISOString(),
    });
  }

  // Keep only the most recently stored events.
  while (eventStore.size > MAX_STORED_EVENTS) {
    const oldestCCID = eventStore.keys().next().value;
    eventStore.delete(oldestCCID);
  }

  console.log(`💾 Stored ${events.length} events`);
  console.log(`📚 Total events in memory: ${eventStore.size}`);
}

/**
 * Retrieve one event using its CCID.
 */
export function getEventByCCID(ccid) {
  if (!ccid) return null;

  return eventStore.get(ccid.toUpperCase()) || null;
}

/**
 * Retrieve all stored events.
 */
export function getAllStoredEvents() {
  return Array.from(eventStore.values());
}

/**
 * Retrieve the latest stored events first.
 */
export function getLatestStoredEvents(limit = 5) {
  return Array.from(eventStore.values())
    .slice(-limit)
    .reverse();
}

/**
 * Return the total number of stored events.
 */
export function getStoredEventCount() {
  return eventStore.size;
}

/**
 * Clear temporary storage.
 */
export function clearEventStore() {
  eventStore.clear();
  console.log("🗑️ Temporary event storage cleared");
}
