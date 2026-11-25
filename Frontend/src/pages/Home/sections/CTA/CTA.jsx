
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  UsersRound,
  CalendarDays,
  Rocket,
  CheckCircle2,
  Star,
} from "lucide-react";

import "./CTA.css";

function CTA() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="final-cta-section" id="get-started">
      <div className="cta-background-glow cta-glow-one" />
      <div className="cta-background-glow cta-glow-two" />

      <div className="cta-grid-pattern" />

      <div className="final-cta-container">

        {/* TOP LABEL */}
        <motion.div
          className="final-cta-eyebrow"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles size={15} />
          YOUR NEXT CHAPTER STARTS HERE
        </motion.div>

        {/* MAIN HEADING */}
        <motion.div
          className="final-cta-heading"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <h2>
            Big ideas aren't
            <br />
            built <span>alone.</span>
          </h2>

          <p>
            Find your people. Discover opportunities.
            Turn your ideas into something extraordinary.
            Your next great collaboration starts here.
          </p>
        </motion.div>

        {/* BUTTONS */}
        <motion.div
          className="final-cta-actions"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
        >
          <a href="/signup" className="final-cta-primary">
            Create your account
            <ArrowRight size={18} />
          </a>

          <a href="/events" className="final-cta-secondary">
            Explore opportunities
          </a>
        </motion.div>

        {/* BENEFITS */}
        <motion.div
          className="final-cta-benefits"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.25 }}
        >
          <div>
            <CheckCircle2 size={15} />
            <span>Discover exciting events</span>
          </div>

          <div>
            <CheckCircle2 size={15} />
            <span>Find your teammates</span>
          </div>

          <div>
            <CheckCircle2 size={15} />
            <span>Build something together</span>
          </div>
        </motion.div>

        {/* DECORATIVE COLLABORATION VISUAL */}
        <motion.div
          className="cta-visual"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="cta-visual-orbit orbit-one" />
          <div className="cta-visual-orbit orbit-two" />

          <div className="cta-visual-icon icon-calendar">
            <CalendarDays size={21} />
          </div>

          <div className="cta-visual-icon icon-users">
            <UsersRound size={22} />
          </div>

          <div className="cta-visual-icon icon-rocket">
            <Rocket size={21} />
          </div>

          <div className="cta-visual-center">
            <Sparkles size={34} />
          </div>

          <div className="cta-floating-note note-left">
            <Star size={13} />
            <span>Find your people</span>
          </div>

          <div className="cta-floating-note note-right">
            <CheckCircle2 size={13} />
            <span>Make it happen</span>
          </div>
        </motion.div>

        {/* BOTTOM STATEMENT */}
        <motion.div
          className="final-cta-bottom"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="cta-bottom-line" />
          <span>DISCOVER. CONNECT. COLLABORATE.</span>
          <span className="cta-bottom-line" />
        </motion.div>

      </div>
    </section>
  );
}

export default CTA;
