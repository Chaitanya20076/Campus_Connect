
import React from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  Sparkles,
  UsersRound,
  Lightbulb,
} from "lucide-react";

import "./AboutHero.css";

function AboutHero() {
  return (
    <section className="about-hero">

      <div className="about-hero-container">

        {/* LEFT CONTENT */}
        <motion.div
          className="about-hero-content"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >

          <div className="about-hero-label">
            <Sparkles size={15} />
            <span>THE STORY BEHIND CAMPUSCONNECT</span>
          </div>

          <h1>
            Connecting students.
            <span> Creating possibilities.</span>
          </h1>

          <p className="about-hero-description">
            We believe every student has something valuable to
            bring to the table. CampusConnect is built to help
            students discover opportunities, find the right
            teammates, and turn ideas into reality.
          </p>

          <div className="about-hero-actions">
            <a href="#our-story" className="about-primary-btn">
              Discover Our Story
              <ArrowDown size={17} />
            </a>

            <div className="about-hero-hackathon">
              <span>BUILT FOR</span>
              <strong>wHACKiest 2026</strong>
            </div>
          </div>

        </motion.div>

        {/* RIGHT VISUAL */}
        <motion.div
          className="about-hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >

          <div className="about-visual-orbit orbit-one"></div>
          <div className="about-visual-orbit orbit-two"></div>

          <div className="about-visual-main">
            <div className="about-visual-icon">
              <UsersRound size={55} />
            </div>

            <h3>Better Together.</h3>

            <p>
              Different skills.
              <br />
              Shared ambitions.
              <br />
              Bigger possibilities.
            </p>
          </div>

          <div className="about-floating-card card-one">
            <div className="about-floating-icon">
              <UsersRound size={19} />
            </div>
            <div>
              <strong>Find Your People</strong>
              <span>Build your team</span>
            </div>
          </div>

          <div className="about-floating-card card-two">
            <div className="about-floating-icon">
              <Lightbulb size={19} />
            </div>
            <div>
              <strong>Explore Ideas</strong>
              <span>Make things happen</span>
            </div>
          </div>

          <div className="about-visual-sparkle sparkle-one">
            ✦
          </div>

          <div className="about-visual-sparkle sparkle-two">
            ✧
          </div>

        </motion.div>

      </div>

      {/* BOTTOM SCROLL INDICATOR */}
      <div className="about-scroll-indicator">
        <span>SCROLL TO EXPLORE</span>
        <ArrowDown size={15} />
      </div>

    </section>
  );
}

export default AboutHero;
