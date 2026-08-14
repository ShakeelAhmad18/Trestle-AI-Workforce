import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const tiers = [
    {
      name: 'Developer Sandbox',
      price: '$0',
      period: 'Forever free',
      description: 'Ideal for indie hackers and developers evaluating autonomous LangGraph multi-agent engineering.',
      features: [
        'LangGraph 7-Node StateGraph',
        'Local isolated subprocess test runner',
        'Standard Claude Sonnet 4.6 & Gemini 2.5 Flash',
        'FastAPI & SQLAlchemy 2.0 clean architecture',
        'Community support',
      ],
      popular: false,
      cta: 'Start Free in Studio',
    },
    {
      name: 'Enterprise Swarm',
      price: '$299',
      period: 'per workspace / month',
      description: 'Full autonomous software agency with dedicated E2B microVMs, private GitHub delivery, and human-in-the-loop gates.',
      features: [
        'All Developer Sandbox features',
        'E2B Firecracker microVM test sandboxes',
        'Automated self-healing fix loops',
        'PyGithub private repository commits & release notes',
        'Tavily API real-time market intelligence',
        'LangSmith tracing & observability dashboards',
        'Priority 24/7 technical support',
      ],
      popular: true,
      cta: 'Deploy Enterprise Agency',
    },
    {
      name: 'Custom Infrastructure',
      price: 'Custom',
      period: 'tailored SLA',
      description: 'Dedicated on-premise or VPC multi-agent clusters with custom LLM weights and compliance certifications.',
      features: [
        'Air-gapped VPC / On-Premise deployment',
        'Custom fine-tuned Claude / Gemini models',
        'SOC2 Type II & HIPAA compliance contracts',
        'Custom tool & internal API integrations',
        'Dedicated Solutions Architect',
      ],
      popular: false,
      cta: 'Contact Architecture Team',
    },
  ];

  return (
    <div className="min-h-screen py-16 px-6 max-w-7xl mx-auto space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold text-[#ff8c5a] uppercase tracking-widest">
          <Zap className="h-3.5 w-3.5" /> Transparent Enterprise Tiers
        </div>
        <h1 className="mt-4 text-4xl md:text-6xl font-normal text-white tracking-tight">
          <span className="font-editorial block">Predictable Pricing for</span>
          <span className="font-editorial text-gradient-orange italic block">Autonomous Workforces</span>
        </h1>
        <p className="mt-4 text-sm md:text-base text-slate-400">
          Deploy an entire software engineering team at a fraction of traditional agency costs.
        </p>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className={`relative rounded-3xl border p-8 flex flex-col justify-between transition-all ${
              tier.popular
                ? 'border-[#ff6b35] bg-[#161622] shadow-[0_0_50px_rgba(255,107,53,0.18)] ring-1 ring-[#ff6b35]'
                : 'border-white/10 bg-[#12121a]'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff7d4d] to-[#e64a19] px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md">
                Most Popular Choice
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
              <p className="text-xs text-slate-400 mb-6">{tier.description}</p>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                <span className="text-xs text-slate-500 font-mono">{tier.period}</span>
              </div>

              <div className="space-y-3 border-t border-white/8 pt-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  What is included:
                </span>
                {tier.features.map((feat, fidx) => (
                  <div key={fidx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-[#ff6b35] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/8">
              <Link
                to="/studio"
                className={`block w-full rounded-full py-3 text-center text-xs font-bold transition-all ${
                  tier.popular
                    ? 'btn-orange-glow text-white'
                    : 'bg-white/[0.06] text-slate-200 hover:bg-white/[0.12]'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
