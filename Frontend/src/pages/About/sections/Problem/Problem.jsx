
import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  UsersRound,
  Workflow,
  ArrowUpRight,
} from "lucide-react";
import "./Problem.css";

const problems = [
  {
    number: "01",
    icon: Search,
    title: "Opportunities are scattered",
    description:
      "Students often miss hackathons, workshops and competitions because event information is spread across multiple platforms and communities.",
    tag: "EVENT DISCOVERY",
  },
  {
    number: "02",
    icon: UsersRound,
    title: "Finding the right teammates is hard",
    description:
      "Having a great idea is only the beginning. Finding people with complementary skills, shared interests and the same ambition can be difficult.",
    tag: "TEAM FORMATION",
  },
  {
    number: "03",
    icon: Workflow,
    title: "Collaboration gets complicated",
    description:
      "Once a team comes together, managing conversations, tasks, deadlines and event details across different tools can become overwhelming.",
    tag: "TEAM COLLABORATION",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function Problem() {
  return (
    <section className="problem-section" id="problem">
      <div className="problem-container">

        {/* Section Heading */}
        <motion.div
          className="problem-heading"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="problem-eyebrow">
            <span className="problem-eyebrow-dot" />
            WHY CAMPUSCONNECT?
          </span>

          <h2>
            Great opportunities.
            <br />
            <span>Disconnected experiences.</span>
          </h2>

          <p>
            College is full of talented students and exciting opportunities.
            But connecting the right people with the right opportunities
            isn't always easy.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <motion.div
          className="problem-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {problems.map((problem) => {
            const Icon = problem.icon;

            return (
              <motion.article
                className="problem-card"
                key={problem.number}
                variants={cardVariants}
                whileHover={{ y: -8 }}
              >
                <div className="problem-card-top">
                  <div className="problem-icon">
                    <Icon size={23} strokeWidth={1.8} />
                  </div>

                  <span className="problem-number">
                    {problem.number}
                  </span>
                </div>

                <span className="problem-tag">
                  {problem.tag}
                </span>

                <h3>{problem.title}</h3>

                <p>{problem.description}</p>

                <div className="problem-card-bottom">
                  <span>AN OPPORTUNITY TO CONNECT</span>
                  <ArrowUpRight size={18} />
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Closing Statement */}
        <motion.div
          className="problem-bottom"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="problem-bottom-line" />
          <p>
            We believe the distance between{" "}
            <strong>having an idea</strong> and{" "}
            <strong>making it happen</strong> should be smaller.
          </p>
          <span className="problem-bottom-line" />
        </motion.div>

      </div>
    </section>
  );
}

export default Problem;
