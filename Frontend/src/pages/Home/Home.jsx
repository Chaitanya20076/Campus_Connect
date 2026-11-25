
import React from "react";

import Hero from "./sections/Hero/Hero";
import Features from "./sections/Features/Features";
import HowItWorks from "./sections/HowItWorks/HowItWorks";
import TrendingEvents from "./sections/TrendingEvents/TrendingEvents";
import MatchingPreview from "./sections/MatchingPreview/MatchingPreview";
import CTA from "./sections/CTA/CTA";

import "./Home.css";

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <TrendingEvents />
      <MatchingPreview />
      <CTA />
    </>
  );
}

export default Home;
