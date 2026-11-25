
import React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  CheckSquare,
  CalendarDays,
  UsersRound,
  Clock3,
  ArrowUpRight,
  Send,
  Paperclip,
  Plus,
  CircleCheck,
  Circle,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import "./WorkspaceStep.css";

const tasks = [
  {
    title: "Finalise project idea",
    owner: "Alex",
    status: "Completed",
    completed: true,
  },
  {
    title: "Build frontend interface",
    owner: "You",
    status: "In progress",
    completed: false,
  },
  {
    title: "Integrate backend APIs",
    owner: "Sarah",
    status: "Upcoming",
    completed: false,
  },
];

const messages = [
  {
    initials: "AK",
    name: "Alex",
    message: "I've uploaded the project outline!",
    time: "10:32 AM",
    own: false,
  },
  {
    initials: "YOU",
    name: "You",
    message: "Great! I'll start with the dashboard.",
    time: "10:35 AM",
    own: true,
  },
];

function WorkspaceStep() {
  return (
    <section className="workspace-step-section" id="workspace-step">
      <div className="workspace-step-container">

        {/* LEFT CONTENT */}
        <motion.div
          className="workspace-step-content"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <span className="workspace-step-eyebrow">
            <span />
            STEP 05 — BUILD SOMETHING TOGETHER
          </span>

          <h2>
            One team.
            <br />
            <span>One shared space.</span>
          </h2>

          <p className="workspace-step-description">
            Once your team is formed, bring your collaboration
            into one organised workspace. Share updates, assign
            responsibilities, track progress and stay on top
            of every important deadline.
          </p>

          <div className="workspace-benefits">

            <div className="workspace-benefit">
              <div className="workspace-benefit-icon">
                <MessageCircle size={19} />
              </div>
              <div>
                <h3>Communicate privately</h3>
                <p>Keep your team conversations and updates together.</p>
              </div>
            </div>

            <div className="workspace-benefit">
              <div className="workspace-benefit-icon">
                <CheckSquare size={19} />
              </div>
              <div>
                <h3>Manage team tasks</h3>
                <p>Assign work, see ownership and track completion.</p>
              </div>
            </div>

            <div className="workspace-benefit">
              <div className="workspace-benefit-icon">
                <CalendarDays size={19} />
              </div>
              <div>
                <h3>Stay ahead of deadlines</h3>
                <p>Keep event dates and important milestones visible.</p>
              </div>
            </div>

          </div>

          <div className="workspace-step-note">
            <Sparkles size={17} />
            <span>
              From the first discussion to the final submission,
              keep your team's journey organised in one place.
            </span>
          </div>
        </motion.div>

        {/* RIGHT WORKSPACE PREVIEW */}
        <motion.div
          className="workspace-preview-area"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75 }}
        >
          <div className="workspace-preview-glow" />

          <div className="workspace-dashboard">

            {/* HEADER */}
            <div className="workspace-dashboard-header">
              <div className="workspace-brand">
                <div className="workspace-brand-icon">
                  <LayoutDashboard size={17} />
                </div>
                <div>
                  <strong>Team Workspace</strong>
                  <span>YOUR COLLABORATION HUB</span>
                </div>
              </div>

              <div className="workspace-team-status">
                <span />
                ACTIVE
              </div>
            </div>

            {/* PROJECT TITLE */}
            <div className="workspace-project-heading">
              <div>
                <span>TEAM PROJECT</span>
                <h3>Campus Innovation</h3>
                <p>Building something meaningful together.</p>
              </div>

              <div className="workspace-project-arrow">
                <ArrowUpRight size={18} />
              </div>
            </div>

            {/* TEAM MEMBERS */}
            <div className="workspace-members">
              <div className="workspace-members-label">
                <span>TEAM MEMBERS</span>
                <span>03 MEMBERS</span>
              </div>

              <div className="workspace-member-avatars">
                <span>AK</span>
                <span>YOU</span>
                <span>SP</span>
                <div className="workspace-add-member">
                  <Plus size={14} />
                </div>
              </div>
            </div>

            {/* TASKS */}
            <div className="workspace-panel">
              <div className="workspace-panel-heading">
                <div>
                  <CheckSquare size={15} />
                  <strong>Team tasks</strong>
                </div>
                <span>VIEW ALL <ArrowUpRight size={12} /></span>
              </div>

              <div className="workspace-task-list">
                {tasks.map((task) => (
                  <div className="workspace-task" key={task.title}>
                    <div className="workspace-task-check">
                      {task.completed ? (
                        <CircleCheck size={17} />
                      ) : (
                        <Circle size={17} />
                      )}
                    </div>

                    <div className="workspace-task-info">
                      <strong>{task.title}</strong>
                      <span>Assigned to {task.owner}</span>
                    </div>

                    <span className={`workspace-task-status ${task.completed ? "done" : task.status === "In progress" ? "progress" : "upcoming"}`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHAT */}
            <div className="workspace-panel workspace-chat-panel">
              <div className="workspace-panel-heading">
                <div>
                  <MessageCircle size={15} />
                  <strong>Team conversation</strong>
                </div>
                <span>PRIVATE CHAT</span>
              </div>

              <div className="workspace-chat-messages">
                {messages.map((message) => (
                  <div
                    className={`workspace-message ${message.own ? "own" : ""}`}
                    key={message.time}
                  >
                    <div className="workspace-message-avatar">
                      {message.initials}
                    </div>
                    <div className="workspace-message-body">
                      <strong>{message.name}</strong>
                      <p>{message.message}</p>
                      <span>{message.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="workspace-chat-input">
                <Paperclip size={14} />
                <span>Write a message...</span>
                <div><Send size={13} /></div>
              </div>
            </div>

            {/* DEADLINE */}
            <div className="workspace-deadline">
              <div className="workspace-deadline-icon">
                <Clock3 size={17} />
              </div>
              <div>
                <strong>Next milestone</strong>
                <span>Project submission · 20 December</span>
              </div>
              <CalendarDays size={16} />
            </div>

          </div>

          {/* FLOATING BADGE */}
          <motion.div
            className="workspace-floating-badge"
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="workspace-floating-icon">
              <CircleCheck size={17} />
            </div>
            <div>
              <strong>Everything in sync.</strong>
              <span>Better teamwork starts here.</span>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}

export default WorkspaceStep;
