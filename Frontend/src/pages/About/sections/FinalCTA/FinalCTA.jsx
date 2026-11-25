
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  UsersRound,
  Sparkles,
} from "lucide-react";
import "./FinalCTA.css";

function FinalCTA() {
  return (
    <section className="final-cta-section">
      <div className="final-cta-glow final-cta-glow-one" />
      <div className="final-cta-glow final-cta-glow-two" />

      <div className="final-cta-container">

        <motion.div
          className="final-cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="final-cta-eyebrow">
            <Sparkles size={14} />
            YOUR NEXT CONNECTION STARTS HERE
          </div>

          <h2>
            Your next big thing
            <br />
            <span>starts with a connection.</span>
          </h2>

          <p>
            Discover opportunities, meet people who share your
            ambition, and turn your ideas into something real.
            Your campus journey has more possibilities waiting.
          </p>

          <div className="final-cta-actions">
            <Link to="/events" className="final-cta-primary">
              <Compass size={17} />
              Explore Events
              <ArrowRight size={17} />
            </Link>

            <Link to="/find-teammates" className="final-cta-secondary">
              <UsersRound size={17} />
              Find Teammates
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="final-cta-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="final-cta-line" />
          <span>DISCOVER. CONNECT. COLLABORATE.</span>
          <span className="final-cta-line" />
        </motion.div>

        <div className="final-cta-decoration">
          CC.
        </div>

      </div>
    </section>
  );
}

export default FinalCTA;
