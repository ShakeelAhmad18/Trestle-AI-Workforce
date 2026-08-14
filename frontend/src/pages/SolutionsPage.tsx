import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Cpu, Code2, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SolutionsPage: React.FC = () => {
  const solutions = [
    {
      title: 'Enterprise Clean Architecture Backends',
      description: 'Zero-technical-debt backend generation adhering strictly to Routers -> Services -> CRUD -> Models layered design patterns.',
      points: [
        'FastAPI 0.115+ with asynchronous routers & dependency injection',
        'SQLAlchemy 2.0 ORM with PostgreSQL database migrations',
        'Strict Pydantic v2 schemas for request validation & serialization',
        'PBKDF2-HMAC password hashing & JWT security tokens',
      ],
      icon: Layers,
    },
    {
      title: 'Zero-Trust Firecracker MicroVM Testing',
      description: 'Autonomous execution in ephemeral E2B Linux sandboxes with real Pytest test runs and error tracebacks.',
      points: [
        'Isolated E2B Firecracker microVM execution',
        'FastAPI TestClient integration & endpoint coverage',
        'Automated stderr compiler error tracebacks routing',
        'Self-healing fix loop until 100% test pass rate',
      ],
      icon: Cpu,
    },
    {
      title: 'Executive Market Intelligence & Scoping',
      description: 'Live global market analysis extracting feature requirements that enterprise customers are actively buying.',
      points: [
        'Tavily Search API real-time marketplace intelligence',
        'Competitor gap identification & monetization scoping',
        'Strict Pydantic v2 MarketResearchReport schemas',
        'Human-in-the-loop approval interrupt gates',
      ],
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen py-16 px-6 max-w-7xl mx-auto space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold text-[#ff8c5a] uppercase tracking-widest">
          <Code2 className="h-3.5 w-3.5" /> Enterprise Solutions
        </div>
        <h1 className="mt-4 text-4xl md:text-6xl font-normal text-white tracking-tight">
          <span className="font-editorial block">Architected for</span>
          <span className="font-editorial text-gradient-orange italic block">Enterprise Reliability</span>
        </h1>
        <p className="mt-4 text-sm md:text-base text-slate-400">
          Scale software delivery with autonomous multi-agent systems that write clean code, execute microVM test suites, and deliver to GitHub without human bottlenecks.
        </p>
      </div>

      {/* Solutions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {solutions.map((sol, idx) => {
          const Icon = sol.icon;
          return (
            <div
              key={idx}
              className="rounded-3xl border border-white/10 bg-[#14141c] p-8 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6b35]/15 border border-[#ff6b35]/30 text-[#ff6b35] mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{sol.title}</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">{sol.description}</p>
                <div className="space-y-2.5 border-t border-white/8 pt-4">
                  {sol.points.map((pt, pidx) => (
                    <div key={pidx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/8">
                <Link
                  to="/studio"
                  className="btn-orange-glow inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white w-full justify-center"
                >
                  Deploy in Studio <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
