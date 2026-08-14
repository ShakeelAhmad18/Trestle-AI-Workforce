import React, { useState } from 'react';
import { GitBranch, Mail, Check, Copy, ExternalLink, ShieldCheck, FolderCheck } from 'lucide-react';
import { useAppSelector } from '../../store';

export const DeliveryCard: React.FC = () => {
  const { deliveryInfo } = useAppSelector((state) => state.workflow);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!deliveryInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <GitBranch className="h-12 w-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-semibold text-slate-300">Awaiting Final Delivery Package</h3>
        <p className="text-sm text-slate-500 max-w-md mt-1">
          Once the test suite passes 100% in the E2B microVM, the Delivery Agent will automatically publish the private GitHub repository and draft the handoff email.
        </p>
      </div>
    );
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(deliveryInfo.handoff_email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* GitHub Repository Card */}
      <div className="rounded-3xl border border-emerald-500/30 bg-[#121818]/80 p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.15)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <GitBranch className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5" /> Deployed to GitHub
              </div>
              <h3 className="text-xl font-bold text-white mt-1">{deliveryInfo.repo_name}</h3>
              <p className="text-xs text-slate-400">Head Commit: <span className="font-mono text-slate-300">{deliveryInfo.commit_sha}</span></p>
            </div>
          </div>

          <a
            href={deliveryInfo.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-orange-glow inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold text-white"
          >
            Open Repository <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Files Delivered Summary */}
        <div className="mt-6 rounded-2xl bg-black/40 p-4 border border-white/8">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
            <FolderCheck className="h-4 w-4 text-[#ff6b35]" /> {deliveryInfo.files_delivered.length} Files Committed
          </div>
          <div className="flex flex-wrap gap-2">
            {deliveryInfo.files_delivered.map((f) => (
              <span key={f} className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-[11px] font-mono text-slate-400">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Handoff Email */}
      <div className="rounded-3xl border border-white/10 bg-[#14141c] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#ff6b35]" />
            <h4 className="text-sm font-bold text-white">Client Handoff Email Summary</h4>
          </div>
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.1] transition-colors"
          >
            {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedEmail ? 'Copied' : 'Copy Email'}
          </button>
        </div>

        <div className="rounded-2xl bg-[#0b0c10] p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {deliveryInfo.handoff_email}
        </div>
      </div>

    </div>
  );
};
