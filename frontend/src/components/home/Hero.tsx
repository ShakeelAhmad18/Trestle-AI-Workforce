import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { AgentCardDeck } from './AgentCardDeck';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-18 md:pb-24">
      <div className="container relative z-10 mx-auto px-6 text-center">
        
        {/* Eyebrow Pill Badge (Matching Screenshot) */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b35] animate-pulse" />
          <span className="text-[11px] font-bold tracking-[0.18em] text-slate-300 uppercase">
            Best Trained Agents
          </span>
        </div>

        {/* Main Editorial Headline (Matching Screenshot: "Orchestrate your AI Workforce") */}
        <h1 className="mx-auto max-w-4xl text-5xl font-normal tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[76px] leading-[1.08]">
          <span className="font-editorial text-white block">
            Orchestrate your
          </span>
          <span className="font-editorial text-gradient-orange italic block mt-1">
            AI Workforce
          </span>
        </h1>

        {/* Subtitle Description */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg md:text-xl font-normal leading-relaxed">
          Deploy autonomous agents to code, research, and manage workflows instantly.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/studio"
            className="btn-orange-glow inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-xl"
          >
            Launch Agent Studio <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/solutions"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all hover:bg-white/[0.09] hover:border-white/25"
          >
            <Play className="h-3.5 w-3.5 text-[#ff8c5a]" /> See Live Workflow
          </Link>
        </div>

        {/* Signature 3D Fanned Radial Deck Display */}
        <div className="mt-4">
          <AgentCardDeck />
        </div>

      </div>
    </section>
  );
};
