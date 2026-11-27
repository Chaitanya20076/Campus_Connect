import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  CalendarDays,
  Users,
  ArrowUpRight,
  Sparkles,
  SlidersHorizontal,
  Clock3,
  Globe2,
  RefreshCw,
  ExternalLink,
  Trophy,
  X,
  Building2,
  CalendarClock,
  RotateCcw,
} from "lucide-react";
import "./Events.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const CATEGORIES = [
  { label: "All Events", value: "" },
  { label: "Hackathons", value: "hackathon" },
  { label: "Workshops", value: "workshop" },
  { label: "Competitions", value: "competition" },
  { label: "Conferences", value: "conference" },
  { label: "Fests", value: "fest" },
  { label: "Webinars", value: "webinar" },
];

const STATUS_FILTERS = ["All", "Upcoming", "Ongoing", "Completed"];

const SUGGESTIONS = [
  { label: "AI Hackathons", query: "AI", location: "", category: "hackathon" },
  { label: "Tech Workshops", query: "technology", location: "", category: "workshop" },
  { label: "Bengaluru Events", query: "", location: "Bengaluru", category: "" },
];

function getDates(event) {
  return event?.dates || event || {};
}

function safeDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(text);
  const parsed = new Date(dateOnly ? `${text}T00:00:00` : text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const date = safeDate(value);
  return date
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;
}

function getEventDate(event) {
  const dates = getDates(event);
  const start = dates.eventStart || dates.startDate || dates.start || dates.start_date;
  const end = dates.eventEnd || dates.endDate || dates.end || dates.end_date;
  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);
  if (!formattedStart) return "";
  return formattedEnd && formattedEnd !== formattedStart
    ? `${formattedStart} – ${formattedEnd}`
    : formattedStart;
}

function getDeadline(event) {
  const dates = getDates(event);
  return formatDate(dates.registrationDeadline || event?.registrationDeadline);
}

function getLocation(event) {
  const location = event?.location;
  if (typeof location === "string") return location || "Location not specified";
  if (location && typeof location === "object") {
    return [location.venue, location.city, location.country].filter(Boolean).join(", ") || "Location not specified";
  }
  return event?.city || "Location not specified";
}

function getMode(event) {
  const mode = typeof event?.location === "object" ? event.location?.mode : event?.mode;
  if (!mode) return "Mode not specified";
  return String(mode).replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTeamSize(event) {
  const team = event?.teamSize || event?.team;
  if (!team) return "Not specified";
  if (typeof team === "string") return team;
  const min = team.minimum ?? team.min ?? team.minSize;
  const max = team.maximum ?? team.max ?? team.maxSize;
  if (min != null && max != null) return `${min}–${max} members`;
  if (max != null) return `Up to ${max} members`;
  if (min != null) return `${min}+ members`;
  return "Not specified";
}

function getPrize(event) {
  const prizes = event?.prizes ?? event?.prize;
  if (prizes == null || prizes === "") return null;
  return Array.isArray(prizes) ? prizes.filter(Boolean).join(" · ") : String(prizes);
}

function getStatusLabel(status) {
  const labels = {
    upcoming: "Upcoming",
    ongoing: "Ongoing",
    completed: "Completed",
  };
  return labels[String(status || "").toLowerCase()] || null;
}

function categoryMatches(event, selected) {
  if (!selected) return true;
  const category = String(event?.category || "").toLowerCase();
  const terms = {
    hackathon: ["hackathon"],
    workshop: ["workshop"],
    competition: ["competition", "contest"],
    conference: ["conference", "summit"],
    fest: ["fest", "festival"],
    webinar: ["webinar", "seminar"],
  };
  return (terms[selected] || [selected]).some((term) => category.includes(term));
}

function statusMatches(event, selected) {
  if (selected === "All") return true;
  const status = String(event?.status || "").toLowerCase();
  return status === selected.toLowerCase();
}

function EventCard({ event, index }) {
  const skills = Array.isArray(event?.requiredSkills) ? event.requiredSkills : [];
  const prize = getPrize(event);
  const registrationUrl = event?.registrationUrl || event?.registration_url || null;
  const eventUrl = event?.eventPageUrl || event?.officialWebsite || event?.shareUrl || null;
  const deadline = getDeadline(event);
  const organiser = event?.organizer || event?.organiser || event?.organizerName;
  const eventName = event?.eventName || event?.title || "Untitled Event";
  const eventDate = getEventDate(event);
  const statusLabel = getStatusLabel(event?.status);

  return (
    <article className={`event-card event-card-theme-${index % 6}`} style={{ "--card-index": index }}>
      <div className="event-card-top">
        <div className="event-category"><span className="category-dot" />{event?.category || "General"}</div>
        {statusLabel && <span className={`event-status status-${event?.status}`}>{statusLabel}</span>}
      </div>

      <div className="event-card-content">
        <h3>{eventName}</h3>
        <p className="event-description">
          {event?.description || "Explore this opportunity and check the organiser's listing for complete details."}
        </p>

        <div className="event-information">
          {eventDate && <div><CalendarDays size={16} /><span>{eventDate}</span></div>}
          <div><MapPin size={16} /><span>{getLocation(event)}</span></div>
          <div><Globe2 size={16} /><span>{getMode(event)}</span></div>
          <div><Users size={16} /><span>{getTeamSize(event)}</span></div>
          {organiser && <div><Building2 size={16} /><span>{organiser}</span></div>}
          <div><CalendarClock size={16} /><span>{deadline ? `Registration deadline: ${deadline}` : "Registration deadline not confirmed"}</span></div>
        </div>

        {skills.length > 0 && (
          <div className="event-skills">
            {skills.slice(0, 4).map((skill, i) => <span key={`${skill}-${i}`}>{skill}</span>)}
            {skills.length > 4 && <span>+{skills.length - 4}</span>}
          </div>
        )}

        {prize && <div className="event-prize"><Trophy size={15} /><span>{prize}</span></div>}
      </div>

      <div className="event-card-footer">
        <span className="event-ccid" title={event?.ccid || "CampusConnect Event"}>{event?.ccid || "CampusConnect Event"}</span>
        <div className="event-card-actions">
          {registrationUrl ? (
            <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="event-action">
              Register <ExternalLink size={14} />
            </a>
          ) : (
            <span className="event-action disabled" aria-disabled="true">Registration unavailable</span>
          )}
          {eventUrl && (
            <a href={eventUrl} target="_blank" rel="noopener noreferrer" className="event-action secondary">
              View event <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Events() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [searchMeta, setSearchMeta] = useState(null);

  const filteredEvents = useMemo(() => events.filter((event) =>
    categoryMatches(event, activeCategory) && statusMatches(event, activeFilter)
  ), [events, activeCategory, activeFilter]);

  const discoverEvents = async (overrides = {}) => {
    const cleanQuery = String(overrides.query ?? query).trim();
    const cleanLocation = String(overrides.location ?? location).trim();
    const category = overrides.category ?? activeCategory;

    if (!cleanQuery && !cleanLocation && !category) {
      setError("Enter a keyword or location, or choose an event category.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setEvents([]);
    setSearchMeta(null);

    try {
      const payload = {
        query: cleanQuery,
        location: cleanLocation,
        category,
        maxResults: 20,
        includeImages: false,
      };

      console.log("CampusConnect event search payload:", payload);
      const response = await fetch(`${API_URL}/api/events/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || `Event discovery failed (${response.status}).`);
      }

      setEvents(Array.isArray(data.events) ? data.events : []);
      setSearchMeta(data.search || null);
    } catch (err) {
      console.error("Event discovery error:", err);
      setError(err.message || "Something went wrong. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    discoverEvents();
  };

  const clearSearch = () => {
    setQuery("");
    setLocation("");
    setActiveCategory("");
    setActiveFilter("All");
    setEvents([]);
    setSearched(false);
    setError("");
    setSearchMeta(null);
  };

  const chooseSuggestion = (suggestion) => {
    setQuery(suggestion.query);
    setLocation(suggestion.location);
    setActiveCategory(suggestion.category);
    setActiveFilter("All");
    discoverEvents(suggestion);
  };

  return (
    <main className="events-page">
      <section className="events-hero">
        <div className="events-hero-decoration decoration-one" />
        <div className="events-hero-decoration decoration-two" />
        <div className="events-hero-inner">
          <div className="events-eyebrow"><Sparkles size={15} /><span>DISCOVER YOUR NEXT OPPORTUNITY</span></div>
          <h1>Find events.<br /><span>Find your people.</span></h1>
          <p className="events-hero-description">From hackathons to workshops, discover opportunities that bring your ideas to life.</p>

          <form className="event-search" onSubmit={handleSubmit}>
            <Search size={21} />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by keyword (e.g. AI, coding, design)..."
              aria-label="Search events by keyword"
            />
            {query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Clear keywords"><X size={17} /></button>}
            <button type="submit" disabled={loading} className="search-button">{loading ? "Searching..." : "Discover"}{!loading && <ArrowUpRight size={17} />}</button>
          </form>

          <div className="location-search">
            <MapPin size={17} />
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location filter (e.g. Bengaluru)"
              aria-label="Filter events by location"
            />
            {location && <button type="button" className="clear-search" onClick={() => setLocation("")} aria-label="Clear location"><X size={16} /></button>}
          </div>

          <div className="popular-searches">
            <span>Quick searches:</span>
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion.label} onClick={() => chooseSuggestion(suggestion)} type="button">{suggestion.label}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="events-results">
        <div className="events-section-heading">
          <div>
            <span className="section-overline">EXPLORE OPPORTUNITIES</span>
            <h2>{searched ? "Search results" : "Discover events"}</h2>
            <p>Find the right opportunity to learn, compete and collaborate.</p>
          </div>
          {searched && <button className="refresh-button" onClick={() => discoverEvents()} disabled={loading} type="button"><RefreshCw size={15} />Search again</button>}
        </div>

        <div className="event-filter-area">
          <div className="filter-group-label">Event category</div>
          <div className="category-filters">
            {CATEGORIES.map((category) => (
              <button
                key={category.value || "all"}
                className={activeCategory === category.value ? "active" : ""}
                onClick={() => setActiveCategory(category.value)}
                type="button"
              >{category.label}</button>
            ))}
          </div>
          <div className="status-filter-heading"><SlidersHorizontal size={16} /><span>Event status</span></div>
          <div className="status-filters">
            {STATUS_FILTERS.map((filter) => (
              <button key={filter} className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)} type="button">{filter}</button>
            ))}
          </div>
        </div>

        {error && <div className="events-error"><span>{error}</span><button onClick={() => setError("")} type="button">Dismiss</button></div>}

        {searchMeta && !loading && (
          <div className="search-summary">
            <span><strong>{searchMeta.totalSources ?? 0}</strong> matching sources</span>
            <span><strong>{searchMeta.usableSources ?? events.length}</strong> usable listings</span>
            {searchMeta.provider && <span>Powered by {searchMeta.provider}</span>}
          </div>
        )}

        {loading ? (
          <div className="events-loading"><div className="loading-spinner" /><h3>Finding opportunities for you...</h3><p>Searching event listings and organising the results.</p></div>
        ) : filteredEvents.length > 0 ? (
          <>
            <div className="results-count">
              <span>Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events</span>
              <span className="results-live"><span />Discovery results</span>
            </div>
            <div className="events-grid">
              {filteredEvents.map((event, index) => <EventCard key={event.ccid || `${event.eventName || event.title}-${index}`} event={event} index={index} />)}
            </div>
          </>
        ) : (
          <div className="events-empty">
            <div className="empty-icon">{searched ? <Search size={27} /> : <CalendarDays size={27} />}</div>
            <h3>{searched ? "No matching events found" : "Your next opportunity starts here"}</h3>
            <p>{searched ? "Try a different keyword, location or category. Some listings may not include confirmed event dates." : "Search for hackathons, workshops, competitions and events happening around you."}</p>
            {searched ? (
              <button className="empty-action" onClick={clearSearch} type="button"><RotateCcw size={15} />Clear search and filters</button>
            ) : (
              <button className="empty-action" onClick={() => chooseSuggestion(SUGGESTIONS[0])} type="button">Explore AI hackathons <ArrowUpRight size={16} /></button>
            )}
          </div>
        )}
      </section>

      <section className="events-bottom-note">
        <div><Clock3 size={18} /><span>Event details are gathered from external listings. Brabble currently provides application deadlines for many hackathon listings, not their actual event dates. Always open the organiser listing to confirm event dates and eligibility before applying.</span></div>
      </section>
    </main>
  );
}
