
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  UsersRound,
  Handshake,
  Rocket,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Code2,
} from "lucide-react";

import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Discover",
    subtitle: "Find your next opportunity",
    description:
      "Explore hackathons, workshops, competitions and exciting events from colleges and communities.",
    icon: Search,
    details: ["Explore events", "Find opportunities"],
  },
  {
    number: "02",
    title: "Match",
    subtitle: "Find people who complement you",
    description:
      "Discover students with skills that complement yours and interests that align with your goals.",
    icon: UsersRound,
    details: ["Skill-based matching", "Compatibility insights"],
  },
  {
    number: "03",
    title: "Connect",
    subtitle: "Build your dream team",
    description:
      "Send collaboration requests, connect with students and form your team when everyone agrees.",
    icon: Handshake,
    details: ["Mutual consent", "Team formation"],
  },
  {
    number: "04",
    title: "Build",
    subtitle: "Turn ideas into reality",
    description:
      "Work together in your team workspace, manage tasks, track deadlines and create something meaningful.",
    icon: Rocket,
    details: ["Team workspace", "Track progress"],
  },
];

function StepIllustration({ number }) {
  if (number === "01") {
    return (
      <div className="step-illustration discover-illustration">
        <div className="discover-search">
          <Search size={16} />
          <span>Find your next event...</span>
        </div>

        <div className="discover-event">
          <div className="discover-event-icon">
            <Code2 size={19} />
          </div>
          <div className="discover-event-info">
            <strong>National Hackathon</strong>
            <span>Technology · Online</span>
          </div>
          <ArrowRight size={16} />
        </div>

        <div className="discover-event second-event">
          <div className="discover-event-icon second">
            <CalendarDays size={19} />
          </div>
          <div className="discover-event-info">
            <strong>Design Workshop</strong>
            <span>Creative · Bengaluru</span>
          </div>
          <ArrowRight size={16} />
        </div>
      </div>
    );
  }

  if (number === "02") {
    return (
      <div className="step-illustration match-illustration">
        <div className="step-match-person person-left">
          <Code2 size={20} />
          <span>Frontend</span>
        </div>

        <div className="step-match-center">
          <Sparkles size={22} />
        </div>

        <div className="step-match-person person-right">
          <Code2 size={20} />
          <span>Backend</span>
        </div>

        <div className="step-match-result">
          <CheckCircle2 size={14} />
          Perfect skill match
        </div>
      </div>
    );
  }

  if (number === "03") {
    return (
      <div className="step-illustration connect-illustration">
        <div className="connect-profile">
          <div className="connect-avatar avatar-a">A</div>
          <div className="connect-profile-info">
            <strong>Alex</strong>
            <span>Frontend Developer</span>
          </div>
        </div>

        <div className="connect-request">
          <Handshake size={19} />
          <span>Collaboration request</span>
        </div>

        <div className="connect-profile">
          <div className="connect-avatar avatar-b">J</div>
          <div className="connect-profile-info">
            <strong>Jordan</strong>
            <span>Backend Developer</span>
          </div>
          <CheckCircle2 className="connect-approved" size={17} />
        </div>
      </div>
    );
  }

  return (
    <div className="step-illustration build-illustration">
      <div className="build-window">
        <div className="build-window-header">
          <div className="build-dots">
            <span />
            <span />
            <span />
          </div>
          <span>Project workspace</span>
        </div>

        <div className="build-progress-label">
          <strong>Project progress</strong>
          <span>75%</span>
        </div>

        <div className="build-progress-track">
          <div className="build-progress-fill" />
        </div>

        <div className="build-completed">
          <CheckCircle2 size={15} />
          <span>Frontend completed</span>
        </div>

        <div className="build-completed pending">
          <Rocket size={15} />
          <span>Preparing final demo</span>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="how-section" id="how-it-works">
      <div className="how-container">

        {/* SECTION HEADER */}
        <motion.div
          className="how-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65 }}
        >
          <div className="how-eyebrow">
            <Sparkles size={15} />
            SIMPLE. PURPOSEFUL. POWERFUL.
          </div>

          <h2>
            From a simple idea
            <span> to something extraordinary.</span>
          </h2>

          <p>
            Getting started is easy. Follow four simple steps to discover
            opportunities, meet the right people and start building together.
          </p>
        </motion.div>

        {/* FOUR STEP JOURNEY */}
        <div className="how-steps">
          <div className="how-connecting-line">
            <div className="how-connecting-progress" />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                className="how-step"
                key={step.number}
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: 30 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.1,
                }}
              >
                <div className="how-step-marker">
                  <div className="how-step-icon">
                    <Icon size={23} />
                  </div>
                  <span>{step.number}</span>
                </div>

                <div className="how-step-card">
                  <StepIllustration number={step.number} />

                  <div className="how-step-content">
                    <span className="how-step-kicker">
                      STEP {step.number}
                    </span>

                    <h3>{step.title}</h3>
                    <h4>{step.subtitle}</h4>

                    <p>{step.description}</p>

                    <div className="how-step-details">
                      {step.details.map((detail) => (
                        <span key={detail}>
                          <CheckCircle2 size={13} />
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* CTA - NOW COMPLETELY BELOW THE GRID */}
        <motion.div
          className="how-bottom"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="how-bottom-content">
            <span>YOUR NEXT CHAPTER STARTS HERE</span>
            <h3>Don't build alone. Build together.</h3>
            <p>
              Find your people, discover opportunities and make your
              next big idea happen.
            </p>
          </div>

          <a href="/signup" className="how-bottom-button">
            Get started
            <ArrowRight size={18} />
          </a>
        </motion.div>

      </div>
    </section>
  );
}

export default HowItWorks;
