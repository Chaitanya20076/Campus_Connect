
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PreAuthLayout from "./components/PreAuthLayout";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
// Temporary placeholder until individual pages are developed
function ComingSoon({ title }) {
  return (
    <div
      style={{
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF4EB",
        color: "#1F273E",
        textAlign: "center",
        padding: "30px",
      }}
    >
      <h1>{title}</h1>
      <p style={{ marginTop: "12px", color: "#77766F" }}>
        We're building something exciting. Stay tuned!
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ALL PUBLIC / PRE-LOGIN PAGES */}
        <Route element={<PreAuthLayout />}>
          <Route path="/about" element={<About />} />

          <Route path="/" element={<Home />} />

          <Route
            path="/events"
            element={<ComingSoon title="Explore Events" />}
          />

          <Route
            path="/find-teammates"
            element={<ComingSoon title="Find Teammates" />}
          />

          <Route
            path="/event-details/:eventId"
            element={<ComingSoon title="Event Details" />}
          />

          <Route
            path="/login"
            element={<ComingSoon title="Welcome Back" />}
          />

          <Route
            path="/signup"
            element={<ComingSoon title="Join CampusConnect" />}
          />

          <Route
            path="/host-dashboard"
            element={<ComingSoon title="Host Dashboard" />}
          />

          <Route
            path="/contact"
            element={<ComingSoon title="Contact Us" />}
          />

          <Route
            path="/privacy"
            element={<ComingSoon title="Privacy Policy" />}
          />

          <Route
            path="/terms"
            element={<ComingSoon title="Terms & Conditions" />}
          />

        </Route>

        {/* PAGES OUTSIDE THE PUBLIC LAYOUT */}
        <Route
          path="/student-dashboard"
          element={<ComingSoon title="Student Dashboard" />}
        />

        <Route
          path="/profile"
          element={<ComingSoon title="Student Profile" />}
        />

        <Route
          path="/workspace"
          element={<ComingSoon title="Team Workspace" />}
        />

        <Route
          path="/create-event"
          element={<ComingSoon title="Create Event" />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;
