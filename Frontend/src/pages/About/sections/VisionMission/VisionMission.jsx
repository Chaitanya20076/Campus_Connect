
import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Target,
  Lightbulb,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import "./VisionMission.css";

function VisionMission() {
  return (
    <section className="vm-section" id="vision-mission">
      <div className="vm-container">

        {/* Section Header */}
        <motion.div
          className="vm-heading"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="vm-eyebrow">
            <Sparkles size={14} />
            WHAT DRIVES US
          </span>

          <h2>
            More than a platform.
            <br />
            <span>A purpose worth building.</span>
          </h2>

          <p>
            We want to create an environment where students
            don't have to navigate opportunities and
            collaboration alone.
          </p>
        </motion.div>

        {/* Vision and Mission */}
        <div className="vm-grid">

          <motion.article
            className="vm-card vm-vision"
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <div className="vm-card-top">
              <div className="vm-icon">
                <Eye size={25} />
              </div>
              <span>01 / OUR VISION</span>
            </div>

            <div className="vm-card-content">
              <h3>
                A campus where
                <br />
                <span>no opportunity</span>
                <br />
                goes unnoticed.
              </h3>

              <p>
                We envision a connected student ecosystem where
                opportunities are accessible, talent finds its
                people, and great ideas have the chance to grow
                beyond classroom walls.
              </p>
            </div>

            <div className="vm-card-decoration">
              <span>VISION</span>
            </div>

            <ArrowUpRight className="vm-card-arrow" size={22} />
          </motion.article>

          <motion.article
            className="vm-card vm-mission"
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <div className="vm-card-top">
              <div className="vm-icon">
                <Target size={25} />
              </div>
              <span>02 / OUR MISSION</span>
            </div>

            <div className="vm-card-content">
              <h3>
                Make meaningful
                <br />
                <span>connections</span>
                <br />
                easier to create.
              </h3>

              <p>
                Our mission is to bring event discovery,
                skill-based teammate matching and team
                collaboration into one accessible platform
                designed around student needs.
              </p>
            </div>

            <div className="vm-card-decoration">
              <span>MISSION</span>
            </div>

            <ArrowUpRight className="vm-card-arrow" size={22} />
          </motion.article>

        </div>

        {/* Closing Statement */}
        <motion.div
          className="vm-belief"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="vm-belief-icon">
            <Lightbulb size={23} />
          </div>

          <div className="vm-belief-content">
            <span>WHAT WE BELIEVE</span>
            <p>
              Talent is everywhere. Opportunity should be too.
            </p>
          </div>

          <div className="vm-belief-mark">CC.</div>
        </motion.div>

      </div>
    </section>
  );
}

export default VisionMission;
