
import React from "react";
import { motion } from "framer-motion";
import {
  UsersRound,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import "./Team.css";

const members = [
  {
    name: "Chaitanya N",
    initials: "CN",
    designation: "Team Lead",
    number: "01",
  },
  {
    name: "Chinmay N Hegde",
    initials: "CH",
    designation: "Team VisionX",
    number: "02",
  },
  {
    name: "C Shreyas",
    initials: "CS",
    designation: "Team VisionX",
    number: "03",
  },
  {
    name: "Kartik Kamat",
    initials: "KK",
    designation: "Team VisionX",
    number: "04",
  },
];

function Team() {
  return (
    <section className="team-section" id="our-team">
      <div className="team-glow team-glow-one" />
      <div className="team-glow team-glow-two" />

      <div className="team-container">

        {/* Heading */}
        <motion.div
          className="team-heading"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="team-eyebrow">
            <UsersRound size={14} />
            THE PEOPLE BEHIND CAMPUSCONNECT
          </span>

          <h2>
            Meet the minds
            <br />
            <span>building the connection.</span>
          </h2>

          <p>
            Four students, one shared vision — making it easier
            for students to discover opportunities, connect
            with people and build together.
          </p>
        </motion.div>

        {/* Institution */}
        <motion.div
          className="team-institution"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="team-institution-icon">
            <GraduationCap size={21} />
          </div>

          <div>
            <span>PROUDLY FROM</span>
            <h3>RNS Institute of Technology</h3>
            <p>Bengaluru, Karnataka</p>
          </div>
        </motion.div>

        {/* Team Members */}
        <div className="team-grid">
          {members.map((member, index) => (
            <motion.article
              className="team-card"
              key={member.number}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
              }}
              whileHover={{ y: -8 }}
            >
              <div className="team-card-top">
                <span className="team-member-number">
                  {member.number}
                </span>

                <ArrowUpRight size={19} />
              </div>

              <div className="team-avatar">
                <span>{member.initials}</span>
                <div className="team-avatar-sparkle">
                  <Sparkles size={13} />
                </div>
              </div>

              <div className="team-member-info">
                <span className="team-member-designation">
                  {member.designation}
                </span>

                <h3>{member.name}</h3>

                <p>RNS Institute of Technology</p>
              </div>

              <div className="team-card-line" />
            </motion.article>
          ))}
        </div>

        {/* Closing Statement */}
        <motion.div
          className="team-bottom"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="team-bottom-dot" />
          <p>
            Different perspectives. One shared ambition.
          </p>
          <span className="team-bottom-dot" />
        </motion.div>

      </div>
    </section>
  );
}

export default Team;
