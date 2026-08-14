import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, GitBranch, Globe, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.07] bg-[#070709] py-14 text-sm text-slate-400">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#e64a19] shadow-[0_0_15px_rgba(255,107,53,0.4)]">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Trestle</span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Autonomous AI software engineering studio. Orchestrating multi-agent state graphs with LangGraph, Claude Sonnet 4.6, E2B microVMs, and PyGithub.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                <GitBranch className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                <Globe className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                <Share2 className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/studio" className="hover:text-white transition-colors">Agent Studio</Link></li>
              <li><Link to="/agents" className="hover:text-white transition-colors">AI Workforce</Link></li>
              <li><Link to="/solutions" className="hover:text-white transition-colors">Clean Architecture</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing & Tiers</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Agents</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/agents" className="hover:text-white transition-colors">Orchestrator</Link></li>
              <li><Link to="/agents" className="hover:text-white transition-colors">System Architect</Link></li>
              <li><Link to="/agents" className="hover:text-white transition-colors">Autonomous Coder</Link></li>
              <li><Link to="/agents" className="hover:text-white transition-colors">Sandbox QA Tester</Link></li>
              <li><Link to="/agents" className="hover:text-white transition-colors">Delivery Agent</Link></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Developers</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="/api/docs" target="_blank" className="hover:text-white transition-colors">FastAPI Docs</a></li>
              <li><a href="https://langchain-ai.github.io/langgraph/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LangGraph Spec</a></li>
              <li><a href="https://e2b.dev" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">E2B Sandboxes</a></li>
              <li><a href="https://smith.langchain.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LangSmith Tracing</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-white/6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Trestle Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">All Agents Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
