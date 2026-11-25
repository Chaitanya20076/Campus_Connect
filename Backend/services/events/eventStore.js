
const eventStore = new Map();

/**
 * Save multiple events using their CCIDs.
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

    eventStore.set(event.ccid, {
      ...event,
      storedAt: new Date().toISOString(),
    });
  }

  console.log(`💾 Stored ${events.length} discovered events`);
}

/**
 * Retrieve an event using its CCID.
 */
export function getEventByCCID(ccid) {
  return eventStore.get(ccid) || null;
}

/**
 * Retrieve all temporarily stored events.
 */
export function getAllStoredEvents() {
  return Array.from(eventStore.values());
}

/**
 * Get total number of stored events.
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
