
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UsersRound,
  LockKeyhole,
  BrainCircuit,
  UserRoundSearch,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Code2,
  Palette,
  Lightbulb,
} from "lucide-react";
import "./FindTeammates.css";

const reasons = [
  {
    icon: UserRoundSearch,
    title: "Your Student Profile",
    description:
      "We need your skills, experience, interests, and the technologies you work with to understand what you bring to a team.",
  },
  {
    icon: BrainCircuit,
    title: "Skill-Based Matching",
    description:
      "Our matching system compares your skills with other students to find people whose abilities complement yours.",
  },
  {
    icon: CalendarDays,
    title: "Event Requirements",
    description:
      "Different events need different teams. We use event details, required skills, team size, and participation preferences to find relevant matches.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Consent",
    description:
      "Your profile information helps us make relevant suggestions. Team connections happen only when both students agree.",
  },
];

function FindTeammates() {
  return (
    <main className="find-teammates-page">
      <section className="ft-hero">
        <div className="ft-container">
          <motion.div
            className="ft-hero-card"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="ft-hero-content">
              <div className="ft-eyebrow">
                <LockKeyhole size={15} />
                <span>MEMBERS-ONLY FEATURE</span>
              </div>

              <h1>
                Find people.
                <br />
                <span>Build something</span>
                <br />
                extraordinary.
              </h1>

              <p className="ft-hero-description">
                Great ideas deserve great teams. Discover students with
                complementary skills, shared interests, and the ambition
                to build something meaningful together.
              </p>

              <div className="ft-login-notice">
                <LockKeyhole size={17} />
                <p>
                  <strong>Login required</strong>
                  <span>
                    Sign in to access personalised teammate matching.
                  </span>
                </p>
              </div>

              <div className="ft-hero-actions">
                <Link to="/login" className="ft-primary-btn">
                  Login to Find Teammates
                  <ArrowRight size={18} />
                </Link>

                <Link to="/signup" className="ft-secondary-link">
                  New here? Create an account
                </Link>
              </div>
            </div>

            <div className="ft-visual">
              <div className="ft-visual-glow" />

              <div className="ft-visual-heading">
                <Sparkles size={17} />
                <span>BETTER TOGETHER</span>
              </div>

              <div className="ft-match-visual">
                <div className="ft-person-card ft-person-left">
                  <div className="ft-avatar ft-avatar-one">
                    <Code2 size={25} />
                  </div>
                  <strong>Developer</strong>
                  <span>Frontend · Backend</span>
                </div>

                <div className="ft-match-center">
                  <div className="ft-match-line" />
                  <div className="ft-match-icon">
                    <UsersRound size={29} />
                  </div>
                  <span>TEAM UP</span>
                </div>

                <div className="ft-person-card ft-person-right">
                  <div className="ft-avatar ft-avatar-two">
                    <Palette size={25} />
                  </div>
                  <strong>Designer</strong>
                  <span>UI/UX · Creativity</span>
                </div>
              </div>

              <div className="ft-visual-footer">
                <Lightbulb size={17} />
                <span>Different skills. One shared vision.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="ft-reasons">
        <div className="ft-container">
          <motion.div
            className="ft-section-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="ft-section-label">WHY SIGN IN?</span>
            <h2>
              Matching starts with
              <span> understanding you.</span>
            </h2>
            <p>
              Finding the right teammate isn't random. We need a little
              information to make every match meaningful.
            </p>
          </motion.div>

          <div className="ft-reason-grid">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;

              return (
                <motion.article
                  className="ft-reason-card"
                  key={reason.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="ft-reason-icon">
                    <Icon size={23} />
                  </div>

                  <h3>{reason.title}</h3>
                  <p>{reason.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ft-bottom">
        <div className="ft-container">
          <div className="ft-bottom-card">
            <div>
              <span className="ft-bottom-label">YOUR NEXT TEAM STARTS HERE</span>
              <h2>
                You bring the idea.
                <br />
                We'll help you find the people.
              </h2>
              <p>
                Create your profile and discover the people who can help
                turn your next big idea into reality.
              </p>
            </div>

            <Link to="/signup" className="ft-bottom-btn">
              Create Your Profile
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default FindTeammates;
