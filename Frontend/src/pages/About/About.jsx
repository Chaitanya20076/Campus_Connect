
import React from "react";

import AboutHero from "./sections/AboutHero/AboutHero";
import Problem from "./sections/Problem/Problem";
import "./About.css";
import Solution from "./sections/Solution/Solution";
import VisionMission from "./sections/VisionMission/VisionMission";
import Team from "./sections/Team/Team";
import Hackathon from "./sections/Hackathon/Hackathon";
import FinalCTA from "./sections/FinalCTA/FinalCTA";
function About() {
  return (
    <div className="about-page">
      <AboutHero />
      <Problem />
      <Solution />
      <VisionMission />
      <Team />
      <Hackathon />
      <FinalCTA />

      {/* Upcoming sections will be added here */}
    </div>
  );
}

export default About;
