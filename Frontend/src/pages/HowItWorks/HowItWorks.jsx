
import React from "react";
import HowHero from "./sections/HowHero/HowHero";
import "./HowItWorks.css";
import ProfileStep from "./sections/ProfileStep/ProfileStep";
function HowItWorks() {
  return (
    <div className="how-it-works-page">
      <HowHero />
      <ProfileStep />

      {/* Upcoming sections will be added here */}
    </div>
  );
}

export default HowItWorks;
