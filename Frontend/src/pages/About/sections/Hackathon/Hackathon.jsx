
import React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Lightbulb,
  UsersRound,
  Code2,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import "./Hackathon.css";

const highlights = [
  {
    icon: Lightbulb,
    title: "An idea",
    description: "Making student opportunities easier to discover.",
  },
  {
    icon: UsersRound,
    title: "A team",
    description: "Four students bringing different perspectives together.",
  },
  {
    icon: Code2,
    title: "A platform",
    description: "Turning the idea into a working student ecosystem.",
  },
];

function Hackathon() {
  return (
    <section className="hackathon-section" id="hackathon">
      <div className="hackathon-container">

        {/* Section Heading */}
        <motion.div
          className="hackathon-heading"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="hackathon-eyebrow">
            <Sparkles size={14} />
            WHERE OUR JOURNEY TAKES SHAPE
          </span>

          <h2>
            Built with ambition.
            <br />
            <span>Driven by possibility.</span>
          </h2>

          <p>
            CampusConnect is our contribution to a more
            connected student community, developed as
            part of wHACKiest 2026.
          </p>
        </motion.div>

        {/* Main Hackathon Panel */}
        <motion.div
          className="hackathon-panel"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <div className="hackathon-panel-content">

            <div className="hackathon-label">
              <Trophy size={15} />
              OUR HACKATHON JOURNEY
            </div>

            <h3>
              wHACKiest
              <span> 2026</span>
            </h3>

            <p>
              A platform born from a simple thought:
              students should never have to miss an opportunity
              or build something great alone.
            </p>

            <div className="hackathon-team-label">
              <span>TEAM</span>
              <strong>VISIONX</strong>
            </div>

            <div className="hackathon-team-members">
              <span>Chaitanya N</span>
              <span>Chinmay N Hegde</span>
              <span>C Shreyas</span>
              <span>Kartik Kamat</span>
            </div>
          </div>

          <div className="hackathon-panel-visual">
            <div className="hackathon-orbit orbit-outer" />
            <div className="hackathon-orbit orbit-inner" />

            <div className="hackathon-visual-center">
              <div className="hackathon-visual-icon">
                <Code2 size={43} />
              </div>
              <span>CAMPUSCONNECT</span>
              <small>EXPLORE. CONNECT. COLLABORATE.</small>
            </div>

            <div className="hackathon-floating-star star-one">
              <Sparkles size={19} />
            </div>

            <div className="hackathon-floating-star star-two">
              <Lightbulb size={19} />
            </div>
          </div>

          <div className="hackathon-panel-decoration">
            CC.
          </div>
        </motion.div>

        {/* Three Highlights */}
        <motion.div
          className="hackathon-highlights"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {highlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <div className="hackathon-highlight" key={item.title}>
                <div className="hackathon-highlight-icon">
                  <Icon size={21} />
                </div>

                <div>
                  <span>0{index + 1}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Final Statement */}
        <motion.div
          className="hackathon-closing"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span>THE JOURNEY STARTS WITH A CONNECTION.</span>
          <h3>
            Let's build something
            <span> meaningful.</span>
          </h3>
          <ArrowUpRight size={23} />
        </motion.div>

      </div>
    </section>
  );
}

export default Hackathon;
