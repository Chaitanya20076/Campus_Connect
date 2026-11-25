
import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* TOP FOOTER SECTION */}
        <div className="footer-top">

          {/* BRAND */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                CC
              </div>

              <span>
                Campus<span>Connect</span>
              </span>
            </Link>

            <p className="footer-description">
              Discover opportunities, find your people, and build
              something meaningful together. Your campus journey
              starts with a connection.
            </p>

            {/* SOCIAL LINKS */}
            <div className="footer-socials">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="footer-social-link"
              >
                IG
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="footer-social-link"
              >
                in
              </a>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="footer-social-link"
              >
                GH
              </a>
            </div>
          </div>

          {/* PLATFORM LINKS */}
          <div className="footer-links-column">
            <h3>Platform</h3>

            <Link to="/events">Explore Events</Link>
            <Link to="/find-teammates">Find Teammates</Link>
            <Link to="/student-dashboard">Student Dashboard</Link>
            <Link to="/host-dashboard">Host an Event</Link>
          </div>

          {/* DISCOVER LINKS */}
          <div className="footer-links-column">
            <h3>Discover</h3>

            <Link to="/events">Hackathons</Link>
            <Link to="/events">Workshops</Link>
            <Link to="/events">Competitions</Link>
            <Link to="/events">Campus Events</Link>
          </div>

          {/* CONTACT */}
          <div className="footer-contact">
            <h3>Let's Connect</h3>

            <p>
              Have a question, suggestion, or partnership idea?
              We'd love to hear from you.
            </p>

            <a
              href="mailto:hello@campusconnect.in"
              className="footer-email"
            >
              <span>✉</span>
              hello@campusconnect.in
              <span>↗</span>
            </a>
          </div>

        </div>

        {/* CALL TO ACTION */}
        <div className="footer-cta">

          <div className="footer-cta-content">
            <div className="footer-cta-icon">
              ✦
            </div>

            <div>
              <h3>
                Your next great connection starts here.
              </h3>

              <p>
                Find your team. Discover opportunities. Make an impact.
              </p>
            </div>
          </div>

          <Link to="/signup" className="footer-cta-button">
            Get Started
            <span>→</span>
          </Link>

        </div>

        {/* BOTTOM FOOTER */}
        <div className="footer-bottom">

          <p>
            © {currentYear} CampusConnect. All rights reserved.
          </p>

          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>

          <p className="footer-made-with">
            Made for students, with <span>♥</span>
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;
