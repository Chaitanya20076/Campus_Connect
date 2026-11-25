
import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  CalendarDays,
  MapPin,
  UsersRound,
  ArrowUpRight,
  Sparkles,
  Code2,
  Lightbulb,
  Filter,
  Clock3,
} from "lucide-react";
import "./DiscoverStep.css";

const events = [
  {
    category: "TECHNICAL",
    title: "Buildathon 2026",
    description: "Build innovative solutions with fellow creators.",
    date: "12 DEC",
    location: "Bengaluru",
    team: "2–4 Members",
    icon: Code2,
    featured: true,
  },
  {
    category: "NON-TECHNICAL",
    title: "Design Thinking Sprint",
    description: "Turn creative ideas into meaningful experiences.",
    date: "18 DEC",
    location: "Online",
    team: "Individual",
    icon: Lightbulb,
    featured: false,
  },
];

const categories = ["All Events", "Technical", "Non-Technical"];

function DiscoverStep() {
  return (
    <section className="discover-step-section" id="discover-step">
      <div className="discover-step-container">

        {/* LEFT CONTENT */}
        <motion.div
          className="discover-step-content"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <span className="discover-step-eyebrow">
            <span />
            STEP 02 — EXPLORE OPPORTUNITIES
          </span>

          <h2>
            Find your next
            <br />
            <span>big opportunity.</span>
          </h2>

          <p className="discover-step-description">
            From hackathons and coding competitions to workshops
            and creative events, discover opportunities happening
            across colleges and communities.
          </p>

          <div className="discover-benefits">

            <div className="discover-benefit">
              <div className="discover-benefit-icon">
                <Search size={19} />
              </div>
              <div>
                <h3>Explore with ease</h3>
                <p>Find events based on categories and interests.</p>
              </div>
            </div>

            <div className="discover-benefit">
              <div className="discover-benefit-icon">
                <CalendarDays size={19} />
              </div>
              <div>
                <h3>Know the details</h3>
                <p>Check dates, venues, eligibility and deadlines.</p>
              </div>
            </div>

            <div className="discover-benefit">
              <div className="discover-benefit-icon">
                <UsersRound size={19} />
              </div>
              <div>
                <h3>Understand team requirements</h3>
                <p>See team sizes and skills needed before joining.</p>
              </div>
            </div>

          </div>

          <div className="discover-note">
            <Sparkles size={17} />
            <span>
              The right opportunity could be the beginning
              of your next big idea.
            </span>
          </div>
        </motion.div>

        {/* RIGHT EVENT DISCOVERY PREVIEW */}
        <motion.div
          className="discover-preview-area"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75 }}
        >
          <div className="discover-preview-glow" />

          <div className="discover-dashboard">

            {/* Dashboard Header */}
            <div className="discover-dashboard-header">
              <div>
                <span>YOUR NEXT OPPORTUNITY</span>
                <h3>Explore events</h3>
              </div>

              <div className="discover-filter-icon">
                <Filter size={17} />
              </div>
            </div>

            {/* Search */}
            <div className="discover-search">
              <Search size={16} />
              <span>Search hackathons, workshops...</span>
            </div>

            {/* Categories */}
            <div className="discover-categories">
              {categories.map((category, index) => (
                <span
                  key={category}
                  className={index === 0 ? "active" : ""}
                >
                  {category}
                </span>
              ))}
            </div>

            {/* Event Count */}
            <div className="discover-results-heading">
              <span>FEATURED OPPORTUNITIES</span>
              <span>02 EVENTS</span>
            </div>

            {/* Event Cards */}
            <div className="discover-event-list">
              {events.map((event, index) => {
                const Icon = event.icon;

                return (
                  <motion.div
                    className="discover-event-card"
                    key={event.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.15,
                    }}
                  >
                    <div className="discover-event-top">
                      <div className="discover-event-icon">
                        <Icon size={21} />
                      </div>

                      <span className={`discover-event-category ${event.featured ? "technical" : "creative"}`}>
                        {event.category}
                      </span>

                      <ArrowUpRight
                        size={17}
                        className="discover-event-arrow"
                      />
                    </div>

                    <h4>{event.title}</h4>
                    <p>{event.description}</p>

                    <div className="discover-event-meta">
                      <span>
                        <CalendarDays size={13} />
                        {event.date}
                      </span>
                      <span>
                        <MapPin size={13} />
                        {event.location}
                      </span>
                      <span>
                        <UsersRound size={13} />
                        {event.team}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="discover-dashboard-footer">
              <Clock3 size={14} />
              <span>More opportunities waiting to be discovered.</span>
              <Sparkles size={15} />
            </div>

          </div>

          {/* Floating Badge */}
          <motion.div
            className="discover-floating-badge"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="discover-floating-icon">
              <Sparkles size={17} />
            </div>
            <div>
              <strong>Explore beyond your campus.</strong>
              <span>Discover more possibilities.</span>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}

export default DiscoverStep;
