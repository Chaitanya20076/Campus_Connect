
import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  UsersRound,
  Trophy,
  Code2,
  Palette,
  Music2,
  Sparkles,
  Clock3,
  ExternalLink,
} from "lucide-react";

import "./TrendingEvents.css";

const events = [
  {
    id: 1,
    title: "National Innovation Hackathon",
    organizer: "Innovation Community",
    category: "Technical",
    date: "12–14 Dec 2026",
    location: "Bengaluru, India",
    format: "Offline",
    participants: "Team of 2–4",
    description:
      "Build creative solutions to real-world problems alongside ambitious innovators.",
    icon: Code2,
    theme: "event-orange",
    tag: "Popular",
  },
  {
    id: 2,
    title: "AI & Machine Learning Summit",
    organizer: "Tech Connect",
    category: "Technical",
    date: "18 Dec 2026",
    location: "Online",
    format: "Online",
    participants: "Individual",
    description:
      "Explore emerging AI technologies, practical applications and industry insights.",
    icon: Sparkles,
    theme: "event-blue",
    tag: "Featured",
  },
  {
    id: 3,
    title: "Campus Cultural Fest",
    organizer: "Student Council",
    category: "Cultural",
    date: "21–22 Dec 2026",
    location: "Bengaluru, India",
    format: "Offline",
    participants: "Open participation",
    description:
      "Celebrate creativity through music, dance, art and unforgettable performances.",
    icon: Music2,
    theme: "event-purple",
    tag: "Trending",
  },
  {
    id: 4,
    title: "Design Thinking Workshop",
    organizer: "Design Collective",
    category: "Other",
    date: "27 Dec 2026",
    location: "Online",
    format: "Online",
    participants: "Individual",
    description:
      "Learn to transform ideas into meaningful experiences through creative design.",
    icon: Palette,
    theme: "event-green",
    tag: "New",
  },
];

const categories = ["All Events", "Technical", "Cultural", "Other"];

function TrendingEvents() {
  const [activeCategory, setActiveCategory] = useState("All Events");
  const shouldReduceMotion = useReducedMotion();

  const filteredEvents = useMemo(() => {
    if (activeCategory === "All Events") return events;

    return events.filter(
      (event) => event.category === activeCategory
    );
  }, [activeCategory]);

  return (
    <section className="trending-section" id="trending-events">
      <div className="trending-container">

        {/* HEADER */}
        <motion.div
          className="trending-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="trending-heading-content">
            <div className="trending-eyebrow">
              <Sparkles size={15} />
              OPPORTUNITIES WORTH EXPLORING
            </div>

            <h2>
              Find something
              <span> worth showing up for.</span>
            </h2>

            <p>
              Discover exciting opportunities, explore new interests
              and find your next big experience.
            </p>
          </div>

          <a href="/events" className="trending-view-all">
            Explore all events
            <ArrowRight size={17} />
          </a>
        </motion.div>

        {/* CATEGORY FILTERS */}
        <div className="trending-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`trending-filter ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* EVENTS GRID */}
        <motion.div layout className="trending-grid">
          {filteredEvents.map((event, index) => {
            const Icon = event.icon;

            return (
              <motion.article
                layout
                key={event.id}
                className="trending-card"
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: 25 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
              >
                {/* EVENT VISUAL */}
                <div className={`trending-card-visual ${event.theme}`}>
                  <div className="event-visual-pattern" />

                  <div className="event-category-label">
                    {event.category}
                  </div>

                  <div className="event-main-icon">
                    <Icon size={38} strokeWidth={1.7} />
                  </div>

                  <div className="event-tag">
                    <Sparkles size={12} />
                    {event.tag}
                  </div>

                  <div className="event-visual-decoration decoration-one" />
                  <div className="event-visual-decoration decoration-two" />
                </div>

                {/* EVENT DETAILS */}
                <div className="trending-card-body">
                  <div className="event-organizer">
                    <span className="organizer-dot" />
                    {event.organizer}
                  </div>

                  <h3>{event.title}</h3>

                  <p className="event-description">
                    {event.description}
                  </p>

                  <div className="event-details-list">
                    <div>
                      <CalendarDays size={15} />
                      <span>{event.date}</span>
                    </div>

                    <div>
                      <MapPin size={15} />
                      <span>{event.location}</span>
                    </div>

                    <div>
                      <UsersRound size={15} />
                      <span>{event.participants}</span>
                    </div>
                  </div>

                  <div className="event-card-footer">
                    <span className="event-format">
                      <Clock3 size={13} />
                      {event.format}
                    </span>

                    <a
                      href="/events"
                      className="event-details-link"
                      aria-label={`Explore ${event.title}`}
                    >
                      Explore
                      <ArrowRight size={15} />
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* EMPTY STATE */}
        {filteredEvents.length === 0 && (
          <div className="trending-empty">
            <Sparkles size={25} />
            <h3>No events found</h3>
            <p>Try exploring another category.</p>
          </div>
        )}

        {/* BOTTOM MESSAGE */}
        <motion.div
          className="trending-bottom"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <Trophy size={22} />
            <span>
              Know an exciting event happening at your college?
            </span>
          </div>

          <a href="/host-dashboard">
            Host an event
            <ExternalLink size={15} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default TrendingEvents;
