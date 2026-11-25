
import React from "react";
import HowHero from "./sections/HowHero/HowHero";
import "./HowItWorks.css";
import ProfileStep from "./sections/ProfileStep/ProfileStep";
import DiscoverStep from "./sections/DiscoverStep/DiscoverStep";
function HowItWorks() {
  return (
    <div className="how-it-works-page">
      <HowHero />
      <ProfileStep />
      <DiscoverStep />

      {/* Upcoming sections will be added here */}
    </div>
  );
}

export default HowItWorks;
