
import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  UserRound,
  UsersRound,
  CalendarDays,
  MessageSquare,
  LockKeyhole,
  Copyright,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Mail,
} from "lucide-react";
import "./Terms.css";

const terms = [
  {
    icon: ShieldCheck,
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using CampusConnect, you agree to these Terms and Conditions. If you do not agree with these terms, please do not use the platform.",
      "These terms apply to all visitors, registered students, event organisers, and other users who access CampusConnect.",
    ],
  },
  {
    icon: UserRound,
    title: "2. Account Registration",
    content: [
      "Certain features of CampusConnect require you to create an account. You agree to provide accurate, current, and complete information when registering.",
      "You are responsible for maintaining the confidentiality of your account credentials and for activities carried out through your account.",
      "You must not impersonate another person, create misleading accounts, or use another person's account without permission.",
    ],
  },
  {
    icon: UsersRound,
    title: "3. Student Profiles and Information",
    content: [
      "CampusConnect allows students to create profiles containing information such as their educational background, skills, interests, projects, achievements, and professional links.",
      "You are responsible for ensuring that the information you provide is accurate and that you have permission to share any content you upload.",
      "Do not upload confidential information, another person's personal information, or content that you are not authorised to share.",
    ],
  },
  {
    icon: CalendarDays,
    title: "4. Events and Registrations",
    content: [
      "CampusConnect may display events, hackathons, workshops, competitions, and other opportunities submitted by organisers or obtained from external sources.",
      "Event details, eligibility requirements, schedules, prizes, and registration conditions may be determined by the respective organisers.",
      "CampusConnect does not guarantee that every listed event is available, accurate, or conducted as described. Always verify important details with the event organiser.",
      "Where registration takes place on an external website, you are responsible for reviewing that website's terms and completing the registration process there.",
    ],
  },
  {
    icon: UsersRound,
    title: "5. Teammate Discovery and Matching",
    content: [
      "CampusConnect may help students discover potential teammates based on information such as skills, interests, experience, availability, and event requirements.",
      "Matching suggestions are recommendations only. We do not guarantee compatibility, successful collaboration, selection for an event, or any particular outcome.",
      "Sending a collaboration request does not automatically create a team. A connection is established only when the relevant users accept the request.",
      "You are responsible for evaluating potential teammates and deciding whether to collaborate with them.",
    ],
  },
  {
    icon: MessageSquare,
    title: "6. Collaboration and Workspaces",
    content: [
      "CampusConnect may provide private team workspaces and collaboration features such as messaging, task management, team information, and deadline tracking.",
      "Users are expected to communicate respectfully, contribute honestly, and use these features for legitimate collaboration.",
      "CampusConnect is not responsible for disagreements, missed deadlines, incomplete contributions, or disputes between team members.",
      "Do not share passwords, sensitive personal information, or confidential material through collaboration features unless you understand the associated risks.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "7. Acceptable Use",
    content: [
      "You agree to use CampusConnect lawfully and respectfully.",
      "You must not harass, threaten, discriminate against, defraud, or deliberately mislead other users.",
      "You must not upload malicious software, attempt unauthorised access, interfere with platform operations, or misuse another user's information.",
      "You must not use CampusConnect to distribute spam, scams, harmful content, or material that violates applicable laws or the rights of others.",
    ],
  },
  {
    icon: LockKeyhole,
    title: "8. Privacy and Data Handling",
    content: [
      "CampusConnect uses information you provide to support platform features such as account management, event discovery, teammate matching, and collaboration.",
      "Some profile information may be visible to other users depending on the features and visibility settings available on the platform.",
      "We aim to handle personal information responsibly and apply appropriate safeguards. However, no online platform can guarantee absolute security.",
      "Please refer to our Privacy Policy for further information about the collection, use, and handling of personal information.",
    ],
  },
  {
    icon: Copyright,
    title: "9. Intellectual Property",
    content: [
      "The CampusConnect name, branding, interface, and original platform materials are protected by applicable intellectual property laws.",
      "You retain ownership of content that you create and upload, subject to any rights belonging to other people.",
      "By submitting content to CampusConnect, you grant the platform permission to use, display, and process that content as reasonably necessary to operate and provide its features.",
      "You must not copy, distribute, or commercially exploit CampusConnect materials without appropriate permission.",
    ],
  },
  {
    icon: ExternalLink,
    title: "10. Third-Party Services and Links",
    content: [
      "CampusConnect may integrate with or link to third-party services, including event registration platforms and external websites.",
      "Those services operate under their own terms and privacy policies. CampusConnect does not control and is not responsible for their content, availability, or practices.",
      "You should review the applicable third-party terms before using an external service.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "11. Availability and Disclaimer",
    content: [
      "CampusConnect is provided on an availability basis. Features may change, be interrupted, or become temporarily unavailable.",
      "We aim to provide useful and reliable information, but we do not guarantee that all platform content, event information, or matching recommendations will always be accurate or uninterrupted.",
      "To the extent permitted by applicable law, CampusConnect is not liable for indirect losses arising from your use of the platform or your interactions with other users.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "12. Suspension and Termination",
    content: [
      "We may restrict, suspend, or terminate access to an account if we reasonably believe that the user has violated these terms, misused the platform, or created a risk to other users or the service.",
      "You may stop using CampusConnect at any time. Account deletion and related data handling will be subject to the platform's available account controls and Privacy Policy.",
    ],
  },
  {
    icon: RefreshCw,
    title: "13. Changes to These Terms",
    content: [
      "We may update these Terms and Conditions as CampusConnect develops or when changes are required for operational or legal reasons.",
      "Updated terms will be published on this page. Continued use of the platform after updated terms take effect indicates acceptance of the revised terms, where permitted by applicable law.",
    ],
  },
  {
    icon: Mail,
    title: "14. Contact Us",
    content: [
      "If you have questions or concerns about these Terms and Conditions, please contact the CampusConnect team through the contact information provided on our website.",
    ],
  },
];

function Terms() {
  return (
    <main className="terms-page">
      <section className="terms-hero">
        <div className="terms-container">
          <motion.div
            className="terms-hero-content"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="terms-eyebrow">
              <FileText size={16} />
              <span>THE IMPORTANT DETAILS</span>
            </div>

            <h1>
              Terms & <span>Conditions</span>
            </h1>

            <p>
              A few ground rules to keep CampusConnect useful, respectful,
              and safe for everyone building something together.
            </p>

            <div className="terms-meta">
              <span>
                <ShieldCheck size={15} />
                Platform Guidelines
              </span>
              <span>
                <UsersRound size={15} />
                For the CampusConnect Community
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="terms-document-section">
        <div className="terms-container terms-layout">
          <aside className="terms-sidebar">
            <div className="terms-sidebar-card">
              <span className="terms-sidebar-label">ON THIS PAGE</span>

              <nav>
                {terms.map((term, index) => (
                  <a key={term.title} href={`#terms-${index + 1}`}>
                    {term.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <motion.article
            className="terms-document"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="terms-introduction">
              <div className="terms-intro-icon">
                <FileText size={23} />
              </div>

              <div>
                <h2>Welcome to CampusConnect</h2>
                <p>
                  These Terms and Conditions explain the basic rules for
                  accessing and using CampusConnect. Please read them
                  carefully before using the platform.
                </p>
              </div>
            </div>

            <div className="terms-divider" />

            {terms.map((term, index) => {
              const Icon = term.icon;

              return (
                <section
                  className="terms-clause"
                  id={`terms-${index + 1}`}
                  key={term.title}
                >
                  <div className="terms-clause-heading">
                    <div className="terms-clause-icon">
                      <Icon size={19} />
                    </div>
                    <h2>{term.title}</h2>
                  </div>

                  <div className="terms-clause-content">
                    {term.content.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="terms-document-footer">
              <ShieldCheck size={19} />
              <p>
                Thank you for being part of CampusConnect. Let's build a
                community where great ideas find the right people.
              </p>
            </div>
          </motion.article>
        </div>
      </section>
    </main>
  );
}

export default Terms;
