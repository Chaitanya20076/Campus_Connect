
import React from "react";
import HowHero from "./sections/HowHero/HowHero";
import "./HowItWorks.css";
import ProfileStep from "./sections/ProfileStep/ProfileStep";
import DiscoverStep from "./sections/DiscoverStep/DiscoverStep";
import TeammateStep from "./sections/TeammateStep/TeammateStep";
import ConnectStep from "./sections/ConnectStep/ConnectStep";
import WorkspaceStep from "./sections/WorkspaceStep/WorkspaceStep";
import FinalCTA from "./sections/FinalCTA/FinalCTA";
function HowItWorks() {
  return (
    <div className="how-it-works-page">
      <HowHero />
      <ProfileStep />
      <DiscoverStep />
      <TeammateStep />
      <ConnectStep />
      <WorkspaceStep />
      <FinalCTA />

      {/* Upcoming sections will be added here */}
    </div>
  );
}

export default HowItWorks;
