import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectAgent } from '../../store/agentSlice';

export const AgentCardDeck: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const agents = useAppSelector((state) => state.agents.agents);

  const heroAgents = [
    { id: 'planner', slotClass: 'card-slot-planner' },
    { id: 'orchestrator', slotClass: 'card-slot-orchestrator' },
    { id: 'architect', slotClass: 'card-slot-architect' },
    { id: 'coder', slotClass: 'card-slot-coder' },
    { id: 'sentry', slotClass: 'card-slot-sentry' },
  ];

  const handleCardClick = (agentId: string) => {
    dispatch(selectAgent(agentId));
    navigate('/studio');
  };

  return (
    <div className="relative w-full py-8">
      {/* Background Arc Spotlight Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-t from-[#ff6b35]/15 via-[#7c3aed]/10 to-transparent blur-3xl" />

      {/* Signature 3D Fanned Radial Deck Stage */}
      <div className="deck-stage">
        {heroAgents.map((slot) => {
          const agent = agents.find((a) => a.id === slot.id);
          if (!agent) return null;

          return (
            <div
              key={agent.id}
              onClick={() => handleCardClick(agent.id)}
              className={`agent-deck-card ${slot.slotClass} group`}
            >
              {/* Avatar Frame with Gradient Border */}
              <div className="relative mb-4.5 h-26 w-26 rounded-full p-1 bg-gradient-to-b from-white/20 via-white/5 to-transparent transition-transform duration-300 group-hover:scale-105">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="h-full w-full rounded-full object-cover shadow-inner bg-[#0d0d12]"
                  onError={(e) => {
                    // Fallback gradient if image still loading
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div
                  className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-[#14141b]"
                  style={{ backgroundColor: agent.color }}
                />
              </div>

              {/* Role Title Badge Pill */}
              <span className="mb-2 inline-block rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1 text-[10px] font-extrabold tracking-widest text-slate-100 uppercase backdrop-blur-md transition-colors group-hover:border-[#ff6b35]/60 group-hover:text-[#ff9568]">
                {agent.role}
              </span>

              {/* Tagline Description */}
              <p className="px-1 text-[12px] font-normal leading-relaxed text-slate-400 transition-colors group-hover:text-slate-200">
                {agent.tagline}
              </p>

              {/* Model Tag on Hover */}
              <div className="mt-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-[10px] font-semibold text-slate-500">
                  {agent.model}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
