import React from 'react';
import { Hero } from '../components/home/Hero';
import { SocialProof } from '../components/home/SocialProof';
import { FeaturesGrid } from '../components/home/FeaturesGrid';
import { AgentStudio } from '../components/studio/AgentStudio';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section matching screenshot */}
      <Hero />

      {/* Trusted By Monochrome Social Proof Bar */}
      <SocialProof />

      {/* Live Enterprise Studio Section */}
      <section className="py-16 bg-[#0c0c10]/60 border-b border-white/[0.06]">
        <AgentStudio />
      </section>

      {/* Enterprise Architecture Features */}
      <FeaturesGrid />
    </div>
  );
};
