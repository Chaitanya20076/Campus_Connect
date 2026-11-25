
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  UsersRound,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

import "./Navbar.css";


const navLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/#about" },
  { name: "How It Works", path: "/#how-it-works" },
  {
    name: "Explore Events",
    path: "/events",
    dropdown: [
      { name: "All Events", path: "/events" },
      { name: "Technical Events", path: "/events?category=technical" },
      { name: "Non-Technical Events", path: "/events?category=non-technical" },
    ],
  },
  { name: "Find Teammates", path: "/find-teammates" },
  {
    name: "More",
    path: null,
    dropdown: [
      { name: "Partners", path: "/partners" },
      { name: "Terms & Conditions", path: "/terms" },
      { name: "Privacy Policy", path: "/privacy" },
    ],
  },
];


function Navbar() {
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Close menus whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
    setEventsOpen(false);
    setMoreOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Check active navigation link
  const isActive = (path) => {
    if (!path) return false;

    if (path === "/") {
      return location.pathname === "/";
    }

    if (path === "/events") {
      return location.pathname.startsWith("/events");
    }

    if (path.startsWith("/#")) {
      return (
        location.pathname === "/" &&
        location.hash === path.substring(1)
      );
    }

    return location.pathname === path;
  };

  // Check whether a dropdown contains the active route
  const isDropdownActive = (items) => {
    return items?.some((item) => {
      const itemPath = item.path.split("?")[0];

      return location.pathname === itemPath;
    });
  };

  // Close all menus
  const closeMenus = () => {
    setMobileOpen(false);
    setEventsOpen(false);
    setMoreOpen(false);
  };

  // Mobile dropdown toggle
  const toggleDropdown = (name) => {
    if (name === "More") {
      setMoreOpen((prev) => !prev);
      setEventsOpen(false);
    } else {
      setEventsOpen((prev) => !prev);
      setMoreOpen(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="cc-navbar">
        <div className="cc-navbar-inner">

          {/* BRAND */}
          <Link
            to="/"
            className="cc-brand"
            onClick={closeMenus}
          >
            <div className="cc-brand-icon">
              <UsersRound size={28} strokeWidth={2.3} />

              <span className="cc-brand-sparkle">
                <Sparkles size={12} />
              </span>
            </div>

            <div className="cc-brand-content">
              <div className="cc-brand-name">
                Campus<span>Connect</span>
              </div>

              <div className="cc-brand-tagline">
                DISCOVER. CONNECT. COLLABORATE.
              </div>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="cc-desktop-nav">
            {navLinks.map((link) => (
              <div
                className={`cc-nav-item ${
                  link.dropdown ? "cc-nav-dropdown" : ""
                }`}
                key={link.name}
              >
                {link.dropdown ? (
                  <>
                    <Link
                      to={link.path || link.dropdown[0].path}
                      className={`cc-nav-link ${
                        isActive(link.path) ||
                        isDropdownActive(link.dropdown)
                          ? "active"
                          : ""
                      }`}
                    >
                      {link.name}
                      <ChevronDown size={15} />
                    </Link>

                    {/* DESKTOP DROPDOWN */}
                    <div className="cc-dropdown-menu">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="cc-dropdown-link"
                        >
                          <span>{item.name}</span>
                          <ArrowRight size={14} />
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    to={link.path}
                    className={`cc-nav-link ${
                      isActive(link.path) ? "active" : ""
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* DESKTOP ACTION BUTTONS */}
          <div className="cc-navbar-actions">
            <Link
              to="/login"
              className="cc-login-btn"
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className="cc-signup-btn"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="cc-mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              className="cc-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenus}
            />

            {/* MENU PANEL */}
            <motion.div
              className="cc-mobile-menu"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
            >
              <div className="cc-mobile-menu-header">
                <span>Explore CampusConnect</span>
                <Sparkles size={17} />
              </div>

              {/* MOBILE LINKS */}
              <nav className="cc-mobile-nav">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.dropdown ? (
                      <>
                        <button
                          className={`cc-mobile-link cc-mobile-dropdown-trigger ${
                            isActive(link.path) ||
                            isDropdownActive(link.dropdown)
                              ? "active"
                              : ""
                          }`}
                          onClick={() => toggleDropdown(link.name)}
                          aria-expanded={
                            link.name === "More"
                              ? moreOpen
                              : eventsOpen
                          }
                        >
                          {link.name}

                          <ChevronDown
                            size={17}
                            className={
                              (
                                link.name === "More"
                                  ? moreOpen
                                  : eventsOpen
                              )
                                ? "rotated"
                                : ""
                            }
                          />
                        </button>

                        {/* MOBILE SUBMENU */}
                        <AnimatePresence>
                          {(link.name === "More"
                            ? moreOpen
                            : eventsOpen) && (
                            <motion.div
                              className="cc-mobile-submenu"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                            >
                              {link.dropdown.map((item) => (
                                <Link
                                  key={item.name}
                                  to={item.path}
                                  onClick={closeMenus}
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={link.path}
                        className={`cc-mobile-link ${
                          isActive(link.path) ? "active" : ""
                        }`}
                        onClick={closeMenus}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* MOBILE ACTIONS */}
              <div className="cc-mobile-actions">
                <Link
                  to="/login"
                  className="cc-mobile-login"
                  onClick={closeMenus}
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="cc-mobile-signup"
                  onClick={closeMenus}
                >
                  Get Started
                  <ArrowRight size={17} />
                </Link>
              </div>

              <div className="cc-mobile-footer">
                DISCOVER. CONNECT. COLLABORATE.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
