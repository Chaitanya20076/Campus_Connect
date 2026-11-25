
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  UsersRound,
  Sparkles,
  Code2,
  Palette,
  Database,
  CheckCircle2,
  ArrowRight,
  Heart,
  Zap,
  Target,
  Search,
} from "lucide-react";

import "./MatchingPreview.css";

const students = [
  {
    id: 1,
    name: "Alex Morgan",
    role: "Frontend Developer",
    initials: "AM",
    college: "Engineering Student",
    skills: ["React", "JavaScript", "CSS"],
    lookingFor: ["Node.js", "Python", "Backend"],
    color: "avatar-orange",
    status: "Looking for teammates",
  },
  {
    id: 2,
    name: "Jordan Lee",
    role: "Backend Developer",
    initials: "JL",
    college: "Engineering Student",
    skills: ["Node.js", "Python", "MongoDB"],
    lookingFor: ["React", "UI/UX", "Frontend"],
    color: "avatar-blue",
    status: "Open to collaborate",
  },
];

function StudentCard({ student, side }) {
  return (
    <motion.div
      className={`matching-student-card ${side}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="matching-student-top">
        <div className={`matching-avatar ${student.color}`}>
          {student.initials}
          <span className="avatar-online-dot" />
        </div>

        <div className="matching-student-info">
          <h3>{student.name}</h3>
          <p>{student.role}</p>
          <span>{student.college}</span>
        </div>
      </div>

      <div className="matching-student-status">
        <span />
        {student.status}
      </div>

      <div className="matching-skills-group">
        <div className="matching-skills-heading">
          <Code2 size={14} />
          Skills
        </div>

        <div className="matching-skill-tags">
          {student.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </div>

      <div className="matching-skills-group looking-group">
        <div className="matching-skills-heading">
          <Search size={14} />
          Looking for
        </div>

        <div className="matching-skill-tags">
          {student.lookingFor.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MatchingPreview() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="matching-section" id="matching-preview">
      <div className="matching-container">

        {/* HEADER */}
        <motion.div
          className="matching-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="matching-eyebrow">
            <UsersRound size={15} />
            GREAT TEAMS START WITH GREAT CONNECTIONS
          </div>

          <h2>
            Your skills deserve
            <span> the right teammates.</span>
          </h2>

          <p>
            You don't need to know everyone. You just need to find
            the right people who complete your team.
          </p>
        </motion.div>

        {/* MAIN MATCHING SHOWCASE */}
        <div className="matching-showcase">

          {/* LEFT SIDE */}
          <div className="matching-showcase-left">
            <div className="matching-showcase-label">
              <Sparkles size={15} />
              A MATCH MADE FOR COLLABORATION
            </div>

            <h3>
              Different skills.
              <span> One shared vision.</span>
            </h3>

            <p>
              CampusConnect helps students discover potential teammates
              based on complementary skills, interests and collaboration goals.
            </p>

            <div className="matching-benefits">
              <div>
                <span className="matching-benefit-icon">
                  <Target size={17} />
                </span>
                <div>
                  <strong>Complementary skills</strong>
                  <span>Find what your team is missing.</span>
                </div>
              </div>

              <div>
                <span className="matching-benefit-icon">
                  <Heart size={17} />
                </span>
                <div>
                  <strong>Mutual connections</strong>
                  <span>Both students choose to connect.</span>
                </div>
              </div>

              <div>
                <span className="matching-benefit-icon">
                  <Zap size={17} />
                </span>
                <div>
                  <strong>Built for collaboration</strong>
                  <span>Turn connections into real projects.</span>
                </div>
              </div>
            </div>

            <a href="/find-teammates" className="matching-explore-button">
              Find your teammates
              <ArrowRight size={18} />
            </a>
          </div>

          {/* RIGHT SIDE */}
          <div className="matching-showcase-right">

            <div className="matching-demo-heading">
              <div>
                <span>EXAMPLE MATCH</span>
                <h3>Meet your potential team</h3>
              </div>

              <div className="matching-demo-indicator">
                <span />
                Demo
              </div>
            </div>

            <div className="matching-cards-area">

              <StudentCard student={students[0]} side="student-left" />

              <motion.div
                className="matching-connection"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="matching-connection-line" />

                <div className="matching-score">
                  <Sparkles size={17} />
                  <strong>92%</strong>
                  <span>Compatibility</span>
                </div>

                <div className="matching-connection-plus">
                  <UsersRound size={17} />
                </div>
              </motion.div>

              <StudentCard student={students[1]} side="student-right" />

            </div>

            {/* COMPLEMENTARY SKILLS */}
            <div className="matching-complement">
              <div className="matching-complement-title">
                <CheckCircle2 size={17} />
                Why this team works
              </div>

              <div className="matching-complement-skills">
                <span>
                  <Code2 size={13} />
                  Frontend
                </span>

                <ArrowRight size={15} />

                <span>
                  <Database size={13} />
                  Backend
                </span>

                <ArrowRight size={15} />

                <span>
                  <Palette size={13} />
                  UI/UX
                </span>
              </div>

              <p>
                Different strengths can come together to build a more
                complete team.
              </p>
            </div>

          </div>
        </div>

        {/* BOTTOM MESSAGE */}
        <motion.div
          className="matching-bottom"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="matching-bottom-icon">
            <UsersRound size={21} />
          </div>

          <div>
            <strong>Don't let a missing skill stop a great idea.</strong>
            <span>Find someone who brings something different to the table.</span>
          </div>

          <a href="/find-teammates">
            Discover teammates
            <ArrowRight size={16} />
          </a>
        </motion.div>

      </div>
    </section>
  );
}

export default MatchingPreview;
