
import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  UserRound,
  Database,
  Target,
  UsersRound,
  CalendarDays,
  LockKeyhole,
  Share2,
  Cookie,
  Clock,
  UserX,
  RefreshCw,
  Mail,
  Eye,
  MessageSquare,
} from "lucide-react";
import "./Privacy.css";

const policies = [
  {
    icon: UserRound,
    title: "1. Information We Collect",
    content: [
      "When you create an account or use CampusConnect, we may collect information that you choose to provide, such as your name, email address, educational institution, course, year of study, and profile details.",
      "You may also choose to provide skills, interests, experience, project details, achievements, GitHub links, LinkedIn profiles, portfolio links, and other information that helps other students understand your background.",
      "We may collect information generated through your use of the platform, such as collaboration requests, workspace activity, messages, and interactions with platform features.",
    ],
  },
  {
    icon: Target,
    title: "2. Why We Use Your Information",
    content: [
      "We use information to create and manage your account, provide access to platform features, and maintain the operation of CampusConnect.",
      "Your information may be used to personalise event discovery, suggest relevant opportunities, support teammate matching, and improve your experience.",
      "We may also use information to communicate important account updates, platform notifications, security messages, and service-related announcements.",
    ],
  },
  {
    icon: UsersRound,
    title: "3. Student Profiles and Visibility",
    content: [
      "Information included in your student profile may be displayed to other CampusConnect users to help them discover potential teammates and collaborators.",
      "Depending on the features available, other users may be able to view details such as your skills, interests, educational background, projects, and professional links.",
      "Please avoid publishing sensitive personal information or information that you do not want other users to see.",
    ],
  },
  {
    icon: Database,
    title: "4. Teammate Matching",
    content: [
      "CampusConnect may use profile information such as skills, interests, experience, availability, and event requirements to suggest potential teammates.",
      "Matching is intended to identify complementary abilities and relevant collaboration opportunities. It is not a guarantee of compatibility or successful teamwork.",
      "Your information is used to support matching features and should not be interpreted as a public endorsement, ranking, or verification of another user.",
    ],
  },
  {
    icon: CalendarDays,
    title: "5. Events and Organiser Information",
    content: [
      "CampusConnect may display event information provided by organisers or obtained from external sources.",
      "If you interact with event listings, register through an external website, or contact an organiser, the information you provide may be handled by that organiser or third-party platform under its own privacy policy.",
      "CampusConnect does not control the privacy practices of external event registration websites.",
    ],
  },
  {
    icon: MessageSquare,
    title: "6. Messages and Collaboration Workspaces",
    content: [
      "When you use team workspaces, collaboration tools, or messaging features, information you submit may be accessible to the members of the relevant team or conversation.",
      "This may include messages, task updates, shared project information, and other collaboration activity.",
      "Do not share passwords, financial details, sensitive personal information, or confidential material unless you are certain that sharing it is appropriate.",
    ],
  },
  {
    icon: LockKeyhole,
    title: "7. Data Security",
    content: [
      "We aim to use reasonable technical and organisational safeguards to protect information handled by CampusConnect against unauthorised access, loss, misuse, or alteration.",
      "However, no internet-based service or electronic storage system can guarantee absolute security.",
      "You are responsible for protecting your account credentials and should notify the CampusConnect team if you believe your account has been accessed without permission.",
    ],
  },
  {
    icon: Share2,
    title: "8. Sharing of Information",
    content: [
      "We do not intend to make your private account credentials publicly available.",
      "Information may be visible to other users when you choose to include it in a profile, participate in a team workspace, or interact with platform features.",
      "Information may also be processed by service providers that help operate CampusConnect, such as authentication, database, hosting, communication, or infrastructure providers.",
      "We may disclose information when required by applicable law or when reasonably necessary to protect the rights, safety, and security of users or the platform.",
    ],
  },
  {
    icon: Cookie,
    title: "9. Cookies and Technical Information",
    content: [
      "CampusConnect and its service providers may use cookies, local storage, or similar technologies where required to support authentication, maintain sessions, remember preferences, and improve platform functionality.",
      "Technical information such as browser type, device information, and diagnostic data may also be processed by the platform or its service providers.",
      "The availability and use of these technologies depend on the platform's implementation and your browser settings.",
    ],
  },
  {
    icon: Clock,
    title: "10. Data Retention",
    content: [
      "We retain information for as long as reasonably necessary to provide the platform, maintain accounts, support collaboration features, comply with applicable legal obligations, and resolve disputes.",
      "Retention periods may vary depending on the type of information, the purpose for which it was collected, and applicable requirements.",
      "When information is no longer required, we aim to delete it or handle it in accordance with applicable requirements and our operational processes.",
    ],
  },
  {
    icon: Eye,
    title: "11. Your Choices and Rights",
    content: [
      "You should provide only information that you are comfortable sharing through CampusConnect.",
      "Where available, you may review or update your profile information through your account settings.",
      "You may contact the CampusConnect team to ask questions about your information or request assistance with accessing, correcting, or deleting personal information.",
      "Requests will be handled subject to applicable laws, identity verification, and any legitimate reasons for retaining certain information.",
    ],
  },
  {
    icon: UserX,
    title: "12. Children's Privacy",
    content: [
      "CampusConnect is designed for students who are legally permitted to use the service.",
      "We do not knowingly seek to collect personal information from children in circumstances where such collection would violate applicable law.",
      "If you believe that a child has provided personal information to the platform inappropriately, please contact the CampusConnect team.",
    ],
  },
  {
    icon: RefreshCw,
    title: "13. Changes to This Privacy Policy",
    content: [
      "We may update this Privacy Policy as CampusConnect evolves, as new features are introduced, or when changes are required by applicable law.",
      "The revised policy will be published on this page. We encourage users to review it periodically.",
      "Where required, we will provide additional notice about significant changes.",
    ],
  },
  {
    icon: Mail,
    title: "14. Contact Us",
    content: [
      "If you have questions, concerns, or requests relating to this Privacy Policy or the handling of your personal information, please contact the CampusConnect team through the contact information provided on our website.",
    ],
  },
];

function Privacy() {
  return (
    <main className="privacy-page">
      <section className="privacy-hero">
        <div className="privacy-container">
          <motion.div
            className="privacy-hero-content"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="privacy-eyebrow">
              <ShieldCheck size={16} />
              <span>YOUR PRIVACY MATTERS</span>
            </div>

            <h1>
              Privacy <span>Policy</span>
            </h1>

            <p>
              Your ideas, your profile, your connections. Here's how
              CampusConnect approaches the information you share while
              discovering opportunities and building teams.
            </p>

            <div className="privacy-meta">
              <span>
                <LockKeyhole size={15} />
                Information Protection
              </span>
              <span>
                <UsersRound size={15} />
                Built Around Student Trust
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="privacy-document-section">
        <div className="privacy-container privacy-layout">
          <aside className="privacy-sidebar">
            <div className="privacy-sidebar-card">
              <span className="privacy-sidebar-label">ON THIS PAGE</span>

              <nav>
                {policies.map((policy, index) => (
                  <a
                    key={policy.title}
                    href={`#privacy-${index + 1}`}
                  >
                    {policy.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <motion.article
            className="privacy-document"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="privacy-introduction">
              <div className="privacy-intro-icon">
                <ShieldCheck size={23} />
              </div>

              <div>
                <h2>Your privacy, our responsibility</h2>
                <p>
                  This Privacy Policy explains how CampusConnect may
                  collect, use, store, and share information when you
                  access or use our platform. Please read it carefully.
                </p>
              </div>
            </div>

            <div className="privacy-divider" />

            {policies.map((policy, index) => {
              const Icon = policy.icon;

              return (
                <section
                  className="privacy-clause"
                  id={`privacy-${index + 1}`}
                  key={policy.title}
                >
                  <div className="privacy-clause-heading">
                    <div className="privacy-clause-icon">
                      <Icon size={19} />
                    </div>

                    <h2>{policy.title}</h2>
                  </div>

                  <div className="privacy-clause-content">
                    {policy.content.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="privacy-document-footer">
              <ShieldCheck size={19} />
              <p>
                Your trust matters to us. Thank you for being part of
                CampusConnect and helping us build a respectful student
                community.
              </p>
            </div>
          </motion.article>
        </div>
      </section>
    </main>
  );
}

export default Privacy;
