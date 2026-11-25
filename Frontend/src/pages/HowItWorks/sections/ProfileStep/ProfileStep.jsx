
import React from "react";
import { motion } from "framer-motion";
import {
  UserRound,
  GraduationCap,
  Code2,
  BriefcaseBusiness,
  Target,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";
import "./ProfileStep.css";

const skills = [
  "React.js",
  "Node.js",
  "Python",
  "UI/UX Design",
  "Machine Learning",
];

const interests = [
  "Hackathons",
  "AI / ML",
  "Web Development",
  "Open Source",
];

const lookingFor = [
  "Backend Developer",
  "AI / ML Enthusiast",
  "UI/UX Designer",
];

function ProfileStep() {
  return (
    <section className="profile-step-section" id="profile-step">
      <div className="profile-step-container">

        {/* LEFT CONTENT */}
        <motion.div
          className="profile-step-content"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <span className="profile-step-eyebrow">
            <span className="profile-step-dot" />
            STEP 01 — BUILD YOUR IDENTITY
          </span>

          <h2>
            Start with
            <br />
            <span>who you are.</span>
          </h2>

          <p className="profile-step-description">
            Create your student profile and let the community
            know what you bring to the table. Showcase your
            skills, interests, projects and the kind of
            collaborators you're looking for.
          </p>

          <div className="profile-step-features">

            <div className="profile-feature">
              <div className="profile-feature-icon">
                <GraduationCap size={19} />
              </div>
              <div>
                <h3>Your academic identity</h3>
                <p>College, course, year and a little about yourself.</p>
              </div>
            </div>

            <div className="profile-feature">
              <div className="profile-feature-icon">
                <Code2 size={19} />
              </div>
              <div>
                <h3>Showcase your abilities</h3>
                <p>Add your technical skills, interests and projects.</p>
              </div>
            </div>

            <div className="profile-feature">
              <div className="profile-feature-icon">
                <Target size={19} />
              </div>
              <div>
                <h3>Define your goals</h3>
                <p>Tell others what skills you're looking for in teammates.</p>
              </div>
            </div>

          </div>

          <div className="profile-step-note">
            <Sparkles size={17} />
            <span>
              Your skills tell your story. Your profile helps
              the right people find you.
            </span>
          </div>
        </motion.div>

        {/* RIGHT PROFILE PREVIEW */}
        <motion.div
          className="profile-preview-area"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75 }}
        >
          <div className="profile-preview-glow" />

          <div className="profile-preview-card">

            {/* Card Header */}
            <div className="profile-preview-header">
              <div>
                <span>YOUR CAMPUSCONNECT PROFILE</span>
                <h3>Profile overview</h3>
              </div>

              <div className="profile-complete">
                <Check size={13} />
                PREVIEW
              </div>
            </div>

            {/* Student Identity */}
            <div className="profile-identity">
              <div className="profile-avatar">
                <UserRound size={31} />
                <span className="profile-avatar-status" />
              </div>

              <div className="profile-identity-info">
                <h3>Your Name</h3>
                <p>Computer Science Student</p>
                <span>
                  <GraduationCap size={13} />
                  Your College · Your Year
                </span>
              </div>
            </div>

            <div className="profile-divider" />

            {/* Skills */}
            <div className="profile-preview-block">
              <div className="profile-block-heading">
                <Code2 size={16} />
                <h4>My Skills</h4>
              </div>

              <div className="profile-tags">
                {skills.map((skill) => (
                  <span className="profile-tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="profile-preview-block">
              <div className="profile-block-heading">
                <Sparkles size={16} />
                <h4>Interests</h4>
              </div>

              <div className="profile-tags interest-tags">
                {interests.map((interest) => (
                  <span className="profile-tag" key={interest}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Looking For */}
            <div className="profile-preview-block">
              <div className="profile-block-heading">
                <Target size={16} />
                <h4>Looking for teammates with</h4>
              </div>

              <div className="profile-tags looking-tags">
                {lookingFor.map((skill) => (
                  <span className="profile-tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="profile-socials">
  <div><span className="profile-social-letter">GH</span> GitHub</div>
  <div><span className="profile-social-letter">in</span> LinkedIn</div>
  <div><span className="profile-social-letter">↗</span> Portfolio</div>
</div>

            <div className="profile-preview-footer">
              <BriefcaseBusiness size={15} />
              <span>Projects and achievements can tell more of your story.</span>
              <ArrowRight size={15} />
            </div>

          </div>

          {/* Floating Badge */}
          <motion.div
            className="profile-floating-badge"
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="profile-floating-icon">
              <Check size={16} />
            </div>
            <div>
              <strong>Your identity, your way.</strong>
              <span>Make your profile stand out.</span>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}

export default ProfileStep;
