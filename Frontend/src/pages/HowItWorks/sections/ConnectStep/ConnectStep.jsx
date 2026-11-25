
import React from "react";
import { motion } from "framer-motion";
import {
  UserRound,
  UsersRound,
  Send,
  Check,
  X,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock3,
} from "lucide-react";
import "./ConnectStep.css";

function ConnectStep() {
  return (
    <section className="connect-step-section" id="connect-step">
      <div className="connect-step-container">

        {/* LEFT CONTENT */}
        <motion.div
          className="connect-step-content"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <span className="connect-step-eyebrow">
            <span />
            STEP 04 — MAKE THE CONNECTION
          </span>

          <h2>
            Good connections
            <br />
            <span>start with a yes.</span>
          </h2>

          <p className="connect-step-description">
            Found someone you'd love to work with? Send them
            a collaboration request, share your idea and let
            them decide. Great teams begin when both people
            are ready to build together.
          </p>

          <div className="connect-benefits">

            <div className="connect-benefit">
              <div className="connect-benefit-icon">
                <Send size={19} />
              </div>
              <div>
                <h3>Send a collaboration request</h3>
                <p>Introduce yourself and explain what you'd like to build.</p>
              </div>
            </div>

            <div className="connect-benefit">
              <div className="connect-benefit-icon">
                <MessageCircle size={19} />
              </div>
              <div>
                <h3>Review and respond</h3>
                <p>The other student can review your request and decide.</p>
              </div>
            </div>

            <div className="connect-benefit">
              <div className="connect-benefit-icon">
                <UsersRound size={19} />
              </div>
              <div>
                <h3>Form a team together</h3>
                <p>Mutual acceptance opens the door to collaboration.</p>
              </div>
            </div>

          </div>

          <div className="connect-step-note">
            <ShieldCheck size={18} />
            <span>
              No forced connections. Every collaboration
              starts with mutual consent.
            </span>
          </div>
        </motion.div>

        {/* RIGHT REQUEST PREVIEW */}
        <motion.div
          className="connect-preview-area"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75 }}
        >
          <div className="connect-preview-glow" />

          <div className="connect-dashboard">

            {/* Header */}
            <div className="connect-dashboard-header">
              <div>
                <span>COLLABORATION REQUEST</span>
                <h3>A new connection</h3>
              </div>

              <div className="connect-header-icon">
                <UsersRound size={19} />
              </div>
            </div>

            {/* Request Sender */}
            <div className="connect-person">
              <div className="connect-avatar sender-avatar">
                <UserRound size={22} />
              </div>

              <div className="connect-person-info">
                <span>REQUEST SENT BY</span>
                <strong>Alex Kumar</strong>
                <p>Frontend Developer</p>
              </div>

              <div className="connect-sent-status">
                <Clock3 size={13} />
                SENT
              </div>
            </div>

            {/* Request Message */}
            <div className="connect-message">
              <span>COLLABORATION MESSAGE</span>
              <p>
                Hey! I'm working on an innovative project
                and would love to have your backend expertise
                on the team. Interested in building together?
              </p>
            </div>

            {/* Request Flow */}
            <div className="connect-flow">
              <div className="connect-flow-line" />

              <div className="connect-flow-item completed">
                <div className="connect-flow-icon">
                  <Send size={15} />
                </div>
                <div>
                  <strong>Request sent</strong>
                  <span>Your invitation has been delivered.</span>
                </div>
                <Check size={16} className="connect-flow-check" />
              </div>

              <div className="connect-flow-item completed">
                <div className="connect-flow-icon">
                  <UserRound size={15} />
                </div>
                <div>
                  <strong>Request reviewed</strong>
                  <span>The other student makes their choice.</span>
                </div>
                <Clock3 size={16} className="connect-flow-pending" />
              </div>
            </div>

            {/* Decision Preview */}
            <div className="connect-decision">
              <span>THE OTHER STUDENT CAN CHOOSE</span>

              <div className="connect-decision-actions">
                <div className="connect-decline">
                  <X size={15} />
                  Decline
                </div>

                <div className="connect-accept">
                  <Check size={15} />
                  Accept request
                </div>
              </div>
            </div>

            {/* Success footer */}
            <div className="connect-success-footer">
              <div className="connect-success-icon">
                <UsersRound size={17} />
              </div>
              <div>
                <strong>Both say yes. A team begins.</strong>
                <span>Accepted connections can move into a private workspace.</span>
              </div>
              <ArrowRight size={16} />
            </div>

          </div>

          {/* Floating badge */}
          <motion.div
            className="connect-floating-badge"
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="connect-floating-icon">
              <Sparkles size={17} />
            </div>
            <div>
              <strong>Built on mutual choice.</strong>
              <span>Connect with confidence.</span>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}

export default ConnectStep;
