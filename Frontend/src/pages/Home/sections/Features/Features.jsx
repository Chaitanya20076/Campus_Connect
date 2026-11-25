
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  UsersRound,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Code2,
  Trophy,
  Target,
} from "lucide-react";

import "./Features.css";

const features = [
  {
    number: "01",
    icon: CalendarDays,
    title: "Discover opportunities",
    description:
      "Never miss an opportunity. Explore hackathons, workshops, fests, competitions and events happening across colleges.",
    tags: ["Hackathons", "Workshops", "Competitions"],
    className: "feature-events",
  },
  {
    number: "02",
    icon: UsersRound,
    title: "Find your perfect team",
    description:
      "Find students who complement your skills. Connect with designers, developers and innovators who share your ambition.",
    tags: ["Skill matching", "Team building", "Networking"],
    className: "feature-matching",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Build things together",
    description:
      "Turn connections into collaborations with dedicated team workspaces, conversations, task tracking and deadlines.",
    tags: ["Team workspace", "Task tracking", "Chat"],
    className: "feature-collaboration",
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Let AI guide your journey",
    description:
      "Get intelligent event suggestions and meaningful teammate recommendations based on your interests and skills.",
    tags: ["AI discovery", "Recommendations", "Smart matching"],
    className: "feature-ai",
  },
];

function FeatureVisual({ type }) {
  if (type === "feature-events") {
    return (
      <div className="feature-visual events-visual">
        <div className="visual-event-card">
          <div className="visual-event-top">
            <span className="visual-event-icon">
              <Trophy size={19} />
            </span>
            <span className="visual-event-status">Registration open</span>
          </div>
          <strong>Buildathon 2026</strong>
          <span className="visual-event-meta">
            <CalendarDays size={13} /> 24–26 December
          </span>
          <div className="visual-event-footer">
            <span>Technology</span>
            <span>Explore <ArrowUpRight size={13} /></span>
          </div>
        </div>

        <div className="visual-event-floating">
          <Sparkles size={16} />
          <span>New opportunities await</span>
        </div>
      </div>
    );
  }

  if (type === "feature-matching") {
    return (
      <div className="feature-visual matching-visual">
        <div className="visual-match-orbit" />
        <div className="visual-match-center">
          <UsersRound size={25} />
        </div>

        <div className="visual-person person-one">
          <Code2 size={19} />
        </div>
        <div className="visual-person person-two">
          <Target size={19} />
        </div>
        <div className="visual-person person-three">
          <Sparkles size={19} />
        </div>

        <div className="visual-match-label">
          <span className="visual-match-dot" />
          Skills connected
        </div>
      </div>
    );
  }

  if (type === "feature-collaboration") {
    return (
      <div className="feature-visual collaboration-visual">
        <div className="visual-workspace">
          <div className="visual-workspace-header">
            <div className="visual-workspace-dots">
              <span />
              <span />
              <span />
            </div>
            <span>Team workspace</span>
          </div>

          <div className="visual-task">
            <span className="visual-task-check">✓</span>
            <span>Design the landing page</span>
            <span className="visual-task-tag">Done</span>
          </div>

          <div className="visual-task">
            <span className="visual-task-empty" />
            <span>Build authentication</span>
            <span className="visual-task-tag pending">In progress</span>
          </div>

          <div className="visual-task">
            <span className="visual-task-empty" />
            <span>Prepare final demo</span>
            <span className="visual-task-tag upcoming">Upcoming</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-visual ai-visual">
      <div className="ai-glow-ring" />
      <div className="ai-main-icon">
        <Sparkles size={34} />
      </div>

      <div className="ai-floating-card ai-card-one">
        <Sparkles size={14} />
        <span>Smart recommendations</span>
      </div>

      <div className="ai-floating-card ai-card-two">
        <UsersRound size={14} />
        <span>Better team matches</span>
      </div>
    </div>
  );
}

function Features() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="features-section" id="features">
      <div className="features-container">

        {/* SECTION HEADER */}
        <motion.div
          className="features-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65 }}
        >
          <div className="features-eyebrow">
            <Sparkles size={15} />
            EVERYTHING YOU NEED TO GROW
          </div>

          <h2>
            More than just an
            <span> event platform.</span>
          </h2>

          <p>
            From finding your next opportunity to building your next big idea,
            everything starts with the right connection.
          </p>
        </motion.div>

        {/* FEATURE CARDS */}
        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                className={`feature-card ${feature.className}`}
                key={feature.number}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 35 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
              >
                <div className="feature-card-top">
                  <div className="feature-icon">
                    <Icon size={23} />
                  </div>

                  <span className="feature-number">
                    {feature.number}
                  </span>
                </div>

                <FeatureVisual type={feature.className} />

                <div className="feature-card-content">
                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>

                  <div className="feature-tags">
                    {feature.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="feature-card-bottom">
                  <span>Explore feature</span>
                  <ArrowUpRight size={17} />
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* BOTTOM MESSAGE */}
        <motion.div
          className="features-bottom"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="features-bottom-icon">
            <UsersRound size={21} />
          </div>

          <p>
            Your next opportunity could be one connection away.
          </p>

          <span>Make that connection.</span>
        </motion.div>
      </div>
    </section>
  );
}

export default Features;
