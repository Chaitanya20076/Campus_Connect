
import React from "react";
import { motion } from "framer-motion";
import {
  Compass,
  UsersRound,
  MessagesSquare,
  ArrowUpRight,
  Sparkles,
  Check,
} from "lucide-react";
import "./Solution.css";

const solutions = [
  {
    number: "01",
    icon: Compass,
    title: "Discover",
    subtitle: "Find opportunities that matter.",
    description:
      "Explore hackathons, technical events, workshops and competitions from different colleges, all in one place.",
    points: [
      "Explore events across colleges",
      "Discover technical and non-technical events",
      "Find opportunities that match your interests",
    ],
  },
  {
    number: "02",
    icon: UsersRound,
    title: "Connect",
    subtitle: "Find people who complement you.",
    description:
      "Connect with students who bring different skills, perspectives and ambitions to your team.",
    points: [
      "Skill-based teammate matching",
      "Find collaborators for specific events",
      "Build teams through mutual acceptance",
    ],
  },
  {
    number: "03",
    icon: MessagesSquare,
    title: "Collaborate",
    subtitle: "Turn teamwork into progress.",
    description:
      "Bring your team together with a dedicated workspace to communicate, organise tasks and track important deadlines.",
    points: [
      "Private team workspace",
      "Task and deadline management",
      "Keep collaboration organised",
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

function Solution() {
  return (
    <section className="solution-section" id="our-solution">
      <div className="solution-glow solution-glow-one" />
      <div className="solution-glow solution-glow-two" />

      <div className="solution-container">

        {/* Heading */}
        <motion.div
          className="solution-heading"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="solution-eyebrow">
            <Sparkles size={14} />
            THE CAMPUSCONNECT APPROACH
          </span>

          <h2>
            From finding opportunities
            <br />
            to <span>making them happen.</span>
          </h2>

          <p>
            CampusConnect brings the entire student collaboration
            journey together — helping you discover, connect and
            build something meaningful.
          </p>
        </motion.div>

        {/* Solution Cards */}
        <div className="solution-grid">
          {solutions.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                className="solution-card"
                key={item.number}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.12 }}
                whileHover={{ y: -8 }}
              >
                <div className="solution-card-top">
                  <div className="solution-icon">
                    <Icon size={24} strokeWidth={1.7} />
                  </div>

                  <span className="solution-number">
                    {item.number}
                  </span>
                </div>

                <h3>{item.title}</h3>
                <h4>{item.subtitle}</h4>

                <p className="solution-description">
                  {item.description}
                </p>

                <div className="solution-points">
                  {item.points.map((point) => (
                    <div className="solution-point" key={point}>
                      <span className="solution-check">
                        <Check size={12} />
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="solution-card-footer">
                  <span>EXPLORE THE POSSIBILITIES</span>
                  <ArrowUpRight size={17} />
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom Statement */}
        <motion.div
          className="solution-bottom"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="solution-bottom-icon">
            <Sparkles size={21} />
          </div>

          <div>
            <span>THE BIGGER PICTURE</span>
            <p>
              Because the next great idea could begin with
              the right connection.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default Solution;
