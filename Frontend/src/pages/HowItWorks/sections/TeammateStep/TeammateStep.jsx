
import React from "react";
import { motion } from "framer-motion";
import {
  UsersRound,
  Code2,
  Palette,
  BrainCircuit,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Send,
  GitBranch,
} from "lucide-react";
import "./TeammateStep.css";

const teammates = [
  {
    initials: "AK",
    name: "Alex Kumar",
    role: "Backend Developer",
    skills: ["Node.js", "MongoDB", "Express"],
    contribution: "Backend development",
    icon: Code2,
    match: "Complementary skills",
  },
  {
    initials: "SP",
    name: "Sarah Patel",
    role: "UI/UX Designer",
    skills: ["Figma", "Wireframing", "Prototyping"],
    contribution: "Product design",
    icon: Palette,
    match: "Creative perspective",
  },
  {
    initials: "RV",
    name: "Rahul Verma",
    role: "AI/ML Developer",
    skills: ["Python", "Machine Learning", "APIs"],
    contribution: "AI integration",
    icon: BrainCircuit,
    match: "Technical complement",
  },
];

function TeammateStep() {
  return (
    <section className="teammate-step-section" id="teammate-step">
      <div className="teammate-step-container">

        {/* LEFT CONTENT */}
        <motion.div
          className="teammate-step-content"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <span className="teammate-step-eyebrow">
            <span />
            STEP 03 — FIND YOUR PEOPLE
          </span>

          <h2>
            Great ideas need
            <br />
            <span>the right people.</span>
          </h2>

          <p className="teammate-step-description">
            Finding teammates shouldn't be a guessing game.
            Discover students whose skills complement yours
            and bring together the right mix of talent for
            your next project or event.
          </p>

          <div className="teammate-benefits">

            <div className="teammate-benefit">
              <div className="teammate-benefit-icon">
                <Target size={19} />
              </div>
              <div>
                <h3>Skill-based discovery</h3>
                <p>Find people based on the skills your team needs.</p>
              </div>
            </div>

            <div className="teammate-benefit">
              <div className="teammate-benefit-icon">
                <GitBranch size={19} />
              </div>
              <div>
                <h3>Complementary strengths</h3>
                <p>Bring developers, designers and innovators together.</p>
              </div>
            </div>

            <div className="teammate-benefit">
              <div className="teammate-benefit-icon">
                <Send size={19} />
              </div>
              <div>
                <h3>Connect by choice</h3>
                <p>Send requests and form teams only when both sides agree.</p>
              </div>
            </div>

          </div>

          <div className="teammate-step-note">
            <Sparkles size={17} />
            <span>
              The best teams aren't always made of people
              with identical skills. They're built on
              strengths that work together.
            </span>
          </div>
        </motion.div>

        {/* RIGHT MATCHING PREVIEW */}
        <motion.div
          className="teammate-preview-area"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75 }}
        >
          <div className="teammate-preview-glow" />

          <div className="teammate-dashboard">

            {/* Header */}
            <div className="teammate-dashboard-header">
              <div>
                <span>TEAM DISCOVERY</span>
                <h3>People you can build with</h3>
              </div>

              <div className="teammate-dashboard-icon">
                <UsersRound size={19} />
              </div>
            </div>

            {/* Your skill profile */}
            <div className="teammate-your-profile">
              <div className="teammate-your-avatar">YOU</div>

              <div className="teammate-your-info">
                <strong>Your profile</strong>
                <span>Frontend Developer</span>
              </div>

              <div className="teammate-looking-label">
                LOOKING FOR
              </div>
            </div>

            <div className="teammate-needs">
              <span>Backend</span>
              <span>UI/UX</span>
              <span>AI / ML</span>
            </div>

            {/* Suggested teammates */}
            <div className="teammate-results-heading">
              <span>SUGGESTED TEAMMATES</span>
              <span>BASED ON SKILLS</span>
            </div>

            <div className="teammate-list">
              {teammates.map((person, index) => {
                const Icon = person.icon;

                return (
                  <motion.div
                    className="teammate-person-card"
                    key={person.initials}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.15,
                    }}
                  >
                    <div className="teammate-person-avatar">
                      {person.initials}
                    </div>

                    <div className="teammate-person-info">
                      <strong>{person.name}</strong>
                      <span>{person.role}</span>

                      <div className="teammate-person-skills">
                        {person.skills.slice(0, 2).map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="teammate-match-icon">
                      <Icon size={17} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Mutual acceptance */}
            <div className="teammate-request-footer">
              <div className="teammate-request-icon">
                <CheckCircle2 size={17} />
              </div>

              <div>
                <strong>Connection by mutual consent</strong>
                <span>Both students agree before a team is formed.</span>
              </div>
            </div>

          </div>

          {/* Floating badge */}
          <motion.div
            className="teammate-floating-badge"
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="teammate-floating-icon">
              <Sparkles size={17} />
            </div>
            <div>
              <strong>Different skills. One team.</strong>
              <span>Better together.</span>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}

export default TeammateStep;
