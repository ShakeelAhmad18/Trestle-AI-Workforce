import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { submitHumanApproval } from '../../store/workflowSlice';

export const HumanApprovalModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { threadId, architectureSpec, status } = useAppSelector((state) => state.workflow);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status !== 'paused_for_approval' || !threadId) {
    return null;
  }

  const handleApprove = async () => {
    setIsSubmitting(true);
    await dispatch(submitHumanApproval({ threadId, approved: true }));
    setIsSubmitting(false);
  };

  const handleRejectWithFeedback = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    await dispatch(submitHumanApproval({ threadId, approved: false, feedback }));
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#ff6b35]/40 bg-[#12121a] p-8 shadow-[0_0_60px_rgba(255,107,53,0.2)]">
        
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff6b35]/15 border border-[#ff6b35]/30 text-[#ff6b35]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 px-3 py-1 text-xs font-bold text-[#ff8c5a] uppercase tracking-wider">
              Human-in-the-Loop Checkpoint
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white">
              System Architecture Approval Required
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              The Architect Agent has synthesized the relational schema and OpenAPI endpoints. Review the design below before proceeding to Claude Sonnet 4.6 code generation.
            </p>
          </div>
        </div>

        {/* Architecture Snapshot Summary */}
        {architectureSpec && (
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-xs font-mono text-slate-300">
            <div className="flex justify-between border-b border-white/8 pb-2 mb-2 font-bold text-white">
              <span>Project: {architectureSpec.project_name}</span>
              <span className="text-[#ff6b35]">{architectureSpec.database_schema.tables.length} Tables • {architectureSpec.api_specification.endpoints.length} Endpoints</span>
            </div>
            <div className="text-slate-400">
              Tables: {architectureSpec.database_schema.tables.map(t => t.table_name).join(', ')}
            </div>
          </div>
        )}

        {/* Revision Input Box */}
        <div className="mt-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Request Architectural Revisions (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Add a webhook table with status enum, or add rate limit of 120/min to login endpoint..."
            rows={3}
            className="w-full rounded-2xl border border-white/12 bg-[#0c0c10] p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/8">
          {feedback.trim() ? (
            <button
              onClick={handleRejectWithFeedback}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
            >
              <RotateCcw className="h-4 w-4" /> Request Revisions ({feedback.length} chars)
            </button>
          ) : null}

          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="btn-orange-glow inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white"
          >
            <CheckCircle2 className="h-4 w-4" /> Approve & Generate Codebase
          </button>
        </div>

      </div>
    </div>
  );
};
