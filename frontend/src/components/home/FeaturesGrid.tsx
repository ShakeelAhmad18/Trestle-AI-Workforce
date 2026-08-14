import React from 'react';
import { Network, Layers, Cpu, RotateCcw, ShieldCheck, GitBranch, Zap } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: Network,
      color: '#ff6b35',
      title: 'LangGraph StateGraph Engine',
      description: 'Multi-agent orchestration state graph with durable MemorySaver checkpointing and conditional interrupt controls.',
      badge: 'Agent Core',
    },
    {
      icon: Layers,
      color: '#3b82f6',
      title: 'Clean Architecture Enforcement',
      description: 'Strict separation of concerns: Routers -> Services -> CRUD -> Models with Pydantic v2 validation and SQLAlchemy 2.0.',
      badge: 'FastAPI / Python',
    },
    {
      icon: Cpu,
      color: '#eab308',
      title: 'E2B Firecracker MicroVMs',
      description: 'Every generated codebase is pushed to an isolated Linux microVM to dynamically install dependencies and run Pytest.',
      badge: 'Zero-Trust Sandbox',
    },
    {
      icon: RotateCcw,
      color: '#a855f7',
      title: 'Self-Healing Test Fix Loops',
      description: 'If pytest encounters compiler errors or failing assertions, stderr logs are routed back to Claude Sonnet 4.6 until 100% pass.',
      badge: 'Auto-Repair',
    },
    {
      icon: ShieldCheck,
      color: '#06b6d4',
      title: 'Human-in-the-Loop Governance',
      description: 'LangGraph interrupts execution before coding, allowing leadership to inspect database ERDs and request revisions.',
      badge: 'Zero Risk',
    },
    {
      icon: GitBranch,
      color: '#10b981',
      title: 'Automated GitHub Delivery',
      description: 'Creates a private GitHub repository via PyGithub, publishes commits, writes documentation, and drafts client emails.',
      badge: 'Continuous Delivery',
    },
  ];

  return (
    <section className="relative py-24 border-t border-white/[0.06] bg-[#09090d]">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-[11px] font-bold tracking-widest text-[#ff8c5a] uppercase">
            <Zap className="h-3.5 w-3.5" /> Enterprise Architecture
          </div>
          <h2 className="mt-4 text-3xl md:text-5xl font-normal text-white tracking-tight">
            <span className="font-editorial block">Engineered for</span>
            <span className="font-editorial text-gradient-orange italic block">Production Scale</span>
          </h2>
          <p className="mt-4 text-sm text-slate-400">
            Autonomous software engineering with enterprise security, typed schemas, and continuous sandboxed test verification.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl border border-white/8 bg-[#121219] p-8 shadow-lg transition-all duration-300 hover:border-white/20 hover:bg-[#161622] hover:-translate-y-1"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl mb-6 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${f.color}15`,
                    border: `1px solid ${f.color}35`,
                    color: f.color,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
                    {f.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 group-hover:text-[#ff9568] transition-colors">
                    {f.title}
                  </h3>
                </div>

                <p className="text-xs leading-relaxed text-slate-400 font-normal">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
