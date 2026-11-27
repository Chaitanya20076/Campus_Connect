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
import HowItWorks from "./pages/HowItWorks/HowItWorks";
import Events from "./pages/Events/Events";
import FindTeammates from "./pages/FindTeammates/FindTeammates";
import Terms from "./pages/Terms/Terms";
import Privacy from "./pages/Privacy/Privacy";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";

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
        {/* PUBLIC PAGES WITH THE PRE-AUTH NAVBAR / FOOTER */}
        <Route element={<PreAuthLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />

          <Route path="/events" element={<Events />} />
          <Route path="/find-teammates" element={<FindTeammates />} />

          <Route
            path="/event-details/:eventId"
            element={<ComingSoon title="Event Details" />}
          />

          <Route
            path="/host-dashboard"
            element={<ComingSoon title="Host Dashboard" />}
          />

          <Route
            path="/contact"
            element={<ComingSoon title="Contact Us" />}
          />

          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>

        {/* FULL-SCREEN AUTH PAGE — OUTSIDE PRE-AUTH LAYOUT */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
