
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  UsersRound,
  Lightbulb,
  Rocket,
  Network,
  Code2,
  Palette,
} from "lucide-react";
import "./FinalCTA.css";

const nodes = [
  { icon: Code2, className: "cta-node-one" },
  { icon: Palette, className: "cta-node-two" },
  { icon: Lightbulb, className: "cta-node-three" },
  { icon: Rocket, className: "cta-node-four" },
];

function FinalCTA() {
  return (
    <section className="how-final-cta-section">
      <div className="how-final-cta-container">

        <motion.div
          className="how-final-cta-panel"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75 }}
        >
          {/* BACKGROUND DECORATION */}
          <div className="final-cta-glow" />
          <div className="final-cta-orbit final-cta-orbit-one" />
          <div className="final-cta-orbit final-cta-orbit-two" />

          {/* LEFT CONTENT */}
          <div className="final-cta-content">
            <div className="final-cta-eyebrow">
              <Sparkles size={14} />
              YOUR NEXT CHAPTER STARTS HERE
            </div>

            <h2>
              Your next big idea
              <br />
              deserves a <span>great team.</span>
            </h2>

            <p>
              Discover opportunities, meet people who complement
              your skills, and turn your ideas into something
              meaningful. Your journey starts with one connection.
            </p>

            <div className="final-cta-actions">
              <Link to="/events" className="final-cta-primary">
                Explore Events
                <ArrowRight size={17} />
              </Link>

              <Link to="/signup" className="final-cta-secondary">
                Create Your Profile
              </Link>
            </div>

            <div className="final-cta-trust">
              <UsersRound size={16} />
              <span>Discover. Connect. Collaborate.</span>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="final-cta-visual">

            <div className="final-cta-network">

              {/* CONNECTION LINES */}
              <svg
                className="final-cta-connections"
                viewBox="0 0 420 350"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M210 175 L90 65" />
                <path d="M210 175 L330 65" />
                <path d="M210 175 L75 275" />
                <path d="M210 175 L345 275" />
              </svg>

              {/* CENTRAL NODE */}
              <motion.div
                className="final-cta-center-node"
                animate={{ scale: [1, 1.045, 1] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Network size={32} />
                <span>CONNECT</span>
              </motion.div>

              {/* SURROUNDING NODES */}
              {nodes.map((node, index) => {
                const Icon = node.icon;

                return (
                  <motion.div
                    key={node.className}
                    className={`final-cta-node ${node.className}`}
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 3 + index * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Icon size={22} />
                  </motion.div>
                );
              })}

              <div className="final-cta-network-label">
                <Sparkles size={13} />
                Different strengths. Shared ambitions.
              </div>

            </div>

          </div>
        </motion.div>

        {/* BOTTOM STATEMENT */}
        <motion.div
          className="final-cta-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <span>BUILT FOR STUDENTS, BY STUDENTS.</span>
          <div className="final-cta-bottom-line" />
          <span>MADE FOR WHAT'S NEXT.</span>
        </motion.div>

      </div>
    </section>
  );
}

export default FinalCTA;
