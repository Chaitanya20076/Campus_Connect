
import React from "react";

import AboutHero from "./sections/AboutHero/AboutHero";
import Problem from "./sections/Problem/Problem";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      <AboutHero />
      <Problem />

      {/* Upcoming sections will be added here */}
    </div>
  );
}

export default About;
