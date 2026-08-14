import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import { Bot, ArrowRight } from 'lucide-react';

export const AgentsPage: React.FC = () => {
  const agents = useAppSelector((state) => state.agents.agents);

  return (
    <div className="min-h-screen py-16 px-6 max-w-7xl mx-auto space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold text-[#ff8c5a] uppercase tracking-widest">
          <Bot className="h-3.5 w-3.5" /> Autonomous Workforce Roster
        </div>
        <h1 className="mt-4 text-4xl md:text-6xl font-normal text-white tracking-tight">
          <span className="font-editorial block">Meet Your Specialized</span>
          <span className="font-editorial text-gradient-orange italic block">AI Engineering Team</span>
        </h1>
        <p className="mt-4 text-sm md:text-base text-slate-400">
          Every agent is purpose-built with dedicated LLM reasoning engines (Claude Sonnet 4.6 & Gemini 2.5 Flash), Pydantic v2 validation contracts, and E2B Firecracker sandboxes.
        </p>
      </div>

      {/* Agents Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="group relative rounded-3xl border border-white/10 bg-[#14141c] p-6 shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:bg-[#181824] hover:-translate-y-1"
          >
            <div>
              <div className="relative mb-5 h-28 w-28 mx-auto rounded-full p-1 bg-gradient-to-b from-white/20 via-white/5 to-transparent">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="h-full w-full rounded-full object-cover bg-[#0d0d12]"
                />
                <div
                  className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#14141c]"
                  style={{ backgroundColor: agent.color }}
                />
              </div>

              <div className="text-center mb-3">
                <span className="inline-block rounded-full border border-white/10 bg-white/[0.05] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#ff8c5a]">
                  {agent.role}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{agent.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{agent.tagline}</p>
              </div>

              <p className="text-xs leading-relaxed text-slate-400 mb-4 text-center">
                {agent.description}
              </p>

              {/* Skills List */}
              <div className="space-y-1.5 border-t border-white/8 pt-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Core Competencies
                </span>
                {agent.skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-1.5 text-xs text-slate-300">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/8 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">{agent.model}</span>
              <Link
                to="/studio"
                className="text-[#ff8c5a] font-bold hover:underline inline-flex items-center gap-1"
              >
                Deploy <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
