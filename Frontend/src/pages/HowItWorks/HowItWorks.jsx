
import React from "react";
import HowHero from "./sections/HowHero/HowHero";
import "./HowItWorks.css";
import ProfileStep from "./sections/ProfileStep/ProfileStep";
import DiscoverStep from "./sections/DiscoverStep/DiscoverStep";
import TeammateStep from "./sections/TeammateStep/TeammateStep";
import ConnectStep from "./sections/ConnectStep/ConnectStep";
function HowItWorks() {
  return (
    <div className="how-it-works-page">
      <HowHero />
      <ProfileStep />
      <DiscoverStep />
      <TeammateStep />
      <ConnectStep />

      {/* Upcoming sections will be added here */}
    </div>
  );
}

export default HowItWorks;
