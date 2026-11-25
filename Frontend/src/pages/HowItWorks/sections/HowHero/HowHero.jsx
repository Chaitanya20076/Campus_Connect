
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Compass,
  UsersRound,
  MessagesSquare,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Network,
} from "lucide-react";
import "./HowHero.css";

const journey = [
  {
    number: "01",
    title: "Discover opportunities",
    description: "Explore events worth your time.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Find your people",
    description: "Connect through complementary skills.",
    icon: UsersRound,
  },
  {
    number: "03",
    title: "Build together",
    description: "Collaborate and bring ideas to life.",
    icon: MessagesSquare,
  },
];

function HowHero() {
  return (
    <section className="how-hero-section">
      <div className="how-hero-container">

        {/* LEFT CONTENT */}
        <motion.div
          className="how-hero-content"
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75 }}
        >
          <div className="how-hero-eyebrow">
            <span className="how-hero-eyebrow-dot" />
            THE CAMPUSCONNECT EXPERIENCE
          </div>

          <h1>
            From your first idea
            <br />
            to your next
            <br />
            <span>big achievement.</span>
          </h1>

          <p className="how-hero-description">
            Discover exciting opportunities, find teammates
            who share your ambition, and collaborate to make
            great things happen. Here's how CampusConnect
            brings it all together.
          </p>

          <div className="how-hero-actions">
            <Link to="/events" className="how-hero-primary">
              Explore Events
              <ArrowRight size={17} />
            </Link>

            <a href="#how-journey" className="how-hero-secondary">
              See How It Works
            </a>
          </div>

          <div className="how-hero-trust">
            <div className="how-hero-trust-icon">
              <CheckCircle2 size={17} />
            </div>
            <span>
              One platform. Your entire collaboration journey.
            </span>
          </div>
        </motion.div>

        {/* RIGHT VISUAL */}
        <motion.div
          className="how-hero-visual"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.15 }}
        >
          <div className="how-hero-visual-glow" />
          <div className="how-hero-visual-glow-secondary" />

          {/* Visual Header */}
          <div className="how-hero-visual-header">
            <div className="how-visual-brand-icon">
              <Network size={19} />
            </div>

            <div>
              <strong>CampusConnect</strong>
              <span>YOUR JOURNEY</span>
            </div>

            <div className="how-visual-live">
              <span />
              CONNECTED
            </div>
          </div>

          {/* Journey Timeline */}
          <div className="how-journey-visual">

            <div className="how-journey-track">
              <div className="how-journey-track-progress" />
            </div>

            {journey.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  className="how-journey-step"
                  key={item.number}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.45 + index * 0.18,
                  }}
                >
                  <div className="how-step-icon">
                    <Icon size={21} />
                  </div>

                  <div className="how-step-content">
                    <span>STEP {item.number}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>

                  <div className="how-step-status">
                    <CheckCircle2 size={17} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Brand Statement */}
          <motion.div
            className="how-hero-bottom-card"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="how-bottom-icon">
              <Zap size={17} />
            </div>

            <div>
              <strong>Ideas become possibilities.</strong>
              <span>One connection at a time.</span>
            </div>

            <Sparkles size={17} className="how-bottom-sparkle" />
          </motion.div>

          {/* Decorative Elements */}
          <div className="how-hero-orbit orbit-one" />
          <div className="how-hero-orbit orbit-two" />

          <span className="how-hero-particle particle-one" />
          <span className="how-hero-particle particle-two" />
          <span className="how-hero-particle particle-three" />
        </motion.div>

      </div>

      {/* SCROLL INDICATOR */}
      <a href="#how-journey" className="how-hero-scroll">
        <span>SCROLL TO EXPLORE</span>
        <div className="how-scroll-line" />
      </a>
    </section>
  );
}

export default HowHero;
