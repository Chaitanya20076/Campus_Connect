
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Users,
  CalendarDays,
  Code2,
  Zap,
  CheckCircle2,
  Trophy,
} from "lucide-react";

import "./Hero.css";

function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="hero-section">
      <div className="hero-grid-bg" />
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />

      <div className="hero-container">
        {/* LEFT CONTENT */}
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          <motion.div className="hero-badge" variants={fadeUp}>
            <span className="hero-badge-icon">
              <Sparkles size={15} />
            </span>
            <span>Where student collaboration begins</span>
          </motion.div>

          <motion.h1 className="hero-heading" variants={fadeUp}>
            Great things happen when
            <span className="hero-heading-highlight">
              {" "}students connect.
            </span>
          </motion.h1>

          <motion.p className="hero-description" variants={fadeUp}>
            Discover exciting events, find teammates with complementary
            skills, and turn your ideas into something extraordinary.
            Your next big opportunity starts here.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp}>
            <a href="/events" className="hero-primary-btn">
              Explore opportunities
              <ArrowRight size={18} />
            </a>

            <a href="/find-teammates" className="hero-secondary-btn">
              <Users size={18} />
              Find your team
            </a>
          </motion.div>

          <motion.div className="hero-social-proof" variants={fadeUp}>
            <div className="hero-avatar-stack">
              <span className="hero-avatar avatar-one">A</span>
              <span className="hero-avatar avatar-two">R</span>
              <span className="hero-avatar avatar-three">S</span>
              <span className="hero-avatar avatar-four">K</span>
            </div>

            <div className="hero-proof-text">
              <div className="hero-proof-stars">★★★★★</div>
              <p>
                <strong>Built for ambitious students</strong>
                <span>Discover. Connect. Collaborate.</span>
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT VISUAL */}
        <motion.div
          className="hero-visual"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="hero-visual-orbit orbit-one" />
          <div className="hero-visual-orbit orbit-two" />
          <div className="hero-visual-orbit orbit-three" />

          {/* MAIN MATCH CARD */}
          <motion.div
            className="hero-match-card"
            animate={shouldReduceMotion ? {} : { y: [0, -12, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="match-card-top">
              <div>
                <span className="match-card-label">
                  <Sparkles size={13} /> SMART MATCH
                </span>
                <h3>Perfect team match</h3>
              </div>

              <div className="match-card-status">
                <span />
                Active
              </div>
            </div>

            <div className="match-members">
              <div className="match-member">
                <div className="member-avatar member-avatar-one">
                  <Code2 size={25} />
                </div>
                <div className="member-info">
                  <strong>Alex</strong>
                  <span>Frontend Developer</span>
                </div>
                <CheckCircle2 className="member-check" size={19} />
              </div>

              <div className="match-connection">
                <div className="connection-line" />
                <span>+</span>
                <div className="connection-line" />
              </div>

              <div className="match-member">
                <div className="member-avatar member-avatar-two">
                  <Zap size={25} />
                </div>
                <div className="member-info">
                  <strong>Jordan</strong>
                  <span>Backend Developer</span>
                </div>
                <CheckCircle2 className="member-check" size={19} />
              </div>
            </div>

            <div className="compatibility-section">
              <div className="compatibility-info">
                <span>Team compatibility</span>
                <strong>92%</strong>
              </div>
              <div className="compatibility-track">
                <motion.div
                  className="compatibility-progress"
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 1.5, delay: 0.6 }}
                />
              </div>
            </div>

            <div className="match-card-footer">
              <CheckCircle2 size={15} />
              <span>Complementary skills found</span>
            </div>
          </motion.div>

          {/* FLOATING EVENT CARD */}
          <motion.div
            className="hero-event-card"
            animate={shouldReduceMotion ? {} : { y: [0, 10, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="event-card-icon">
              <Trophy size={22} />
            </div>

            <div className="event-card-content">
              <span>UPCOMING EVENT</span>
              <strong>Hackathon 2026</strong>
              <small>
                <CalendarDays size={13} />
                Registration open
              </small>
            </div>

            <span className="event-card-arrow">
              <ArrowRight size={16} />
            </span>
          </motion.div>

          {/* FLOATING SKILLS CARD */}
          <motion.div
            className="hero-skills-card"
            animate={shouldReduceMotion ? {} : { y: [0, -9, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <div className="skills-card-heading">
              <Users size={16} />
              <strong>Team skills</strong>
            </div>

            <div className="skill-tags">
              <span>React</span>
              <span>Node.js</span>
              <span>UI/UX</span>
              <span>AI/ML</span>
            </div>
          </motion.div>

          {/* FLOATING NOTIFICATION */}
          <motion.div
            className="hero-notification"
            animate={shouldReduceMotion ? {} : { y: [0, 7, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="notification-icon">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <strong>Connection made!</strong>
              <span>Your next teammate awaits.</span>
            </div>
          </motion.div>

          <div className="hero-sparkle sparkle-one">
            <Sparkles size={22} />
          </div>
          <div className="hero-sparkle sparkle-two">
            <Sparkles size={15} />
          </div>
          <div className="hero-sparkle sparkle-three">
            <Sparkles size={18} />
          </div>
        </motion.div>
      </div>

      {/* BOTTOM STRIP */}
      <div className="hero-bottom-strip">
        <div className="hero-strip-inner">
          <span>ONE PLATFORM</span>
          <span className="strip-dot">✦</span>
          <span>ENDLESS OPPORTUNITIES</span>
          <span className="strip-dot">✦</span>
          <span>BETTER TOGETHER</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
