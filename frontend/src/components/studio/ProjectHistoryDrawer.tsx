import React, { useEffect } from 'react';
import {
  X,
  FolderGit2,
  Download,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  FileCode,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchProjectHistory,
  fetchWorkflowStatus,
  downloadProjectZip,
  resetActiveSession,
  setHistoryDrawerOpen,
} from '../../store/workflowSlice';
import { setActiveStudioTab } from '../../store/uiSlice';

export const ProjectHistoryDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isHistoryDrawerOpen, projectHistory, threadId, isDownloadingZip } = useAppSelector(
    (state) => state.workflow
  );
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isHistoryDrawerOpen && token && user?.is_verified) {
      dispatch(fetchProjectHistory());
    }
  }, [isHistoryDrawerOpen, token, user, dispatch]);

  if (!isHistoryDrawerOpen) return null;

  const handleSelectSession = (selectedThreadId: string) => {
    dispatch(fetchWorkflowStatus(selectedThreadId));
    dispatch(setActiveStudioTab('code'));
    dispatch(setHistoryDrawerOpen(false));
  };

  const handleNewProject = () => {
    dispatch(resetActiveSession());
    dispatch(setActiveStudioTab('swarm'));
    dispatch(setHistoryDrawerOpen(false));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case 'paused_for_approval':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="h-3 w-3" /> Review Required
          </span>
        );
      case 'running':
      case 'testing':
      case 'fixing':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
            <Clock className="h-3 w-3 animate-spin" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-2.5 py-0.5 text-[10px] font-bold text-slate-400 border border-white/10">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={() => dispatch(setHistoryDrawerOpen(false))} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#111118] border-l border-white/12 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0d0d12]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff6b35]/20 text-[#ff8c5a] border border-[#ff6b35]/30">
              <FolderGit2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Project History & Sessions</h3>
              <p className="text-[11px] text-slate-400">{projectHistory.length} saved project generations in MongoDB</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(setHistoryDrawerOpen(false))}
            className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action: Create Fresh Project Session */}
        <div className="p-4 border-b border-white/8 bg-white/[0.02]">
          <button
            onClick={handleNewProject}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#ff6b35]/40 bg-[#ff6b35]/15 py-2.5 text-xs font-bold text-[#ff8c5a] hover:bg-[#ff6b35]/25 transition-all shadow-md"
          >
            <Plus className="h-4 w-4" /> Start New Autonomous Project
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {projectHistory.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <FolderGit2 className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No saved projects found for your account yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Deploy a swarm from the Studio to save your first project.</p>
            </div>
          ) : (
            projectHistory.map((item) => {
              const isCurrent = item.thread_id === threadId;
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              return (
                <div
                  key={item.thread_id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isCurrent
                      ? 'border-[#ff6b35] bg-[#ff6b35]/10 shadow-[0_0_20px_rgba(255,107,53,0.15)] ring-1 ring-[#ff6b35]'
                      : 'border-white/8 bg-[#15151e] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {getStatusBadge(item.status)}
                    <span className="text-[10px] font-mono text-slate-500">{dateStr}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-2 mb-2">
                    {item.prompt}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/6 mb-3">
                    <span className="flex items-center gap-1 font-mono">
                      <FileCode className="h-3 w-3 text-slate-500" /> {item.file_count} files
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      ID: {item.thread_id.slice(0, 8)}...
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelectSession(item.thread_id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {isCurrent ? 'Active Project' : 'Open Project'} <ArrowRight className="h-3 w-3" />
                    </button>

                    {item.file_count > 0 && (
                      <button
                        onClick={() => dispatch(downloadProjectZip(item.thread_id))}
                        disabled={isDownloadingZip}
                        title="Download Source Code .ZIP"
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-[#ff6b35]/20 hover:text-[#ff8c5a] hover:border-[#ff6b35]/40 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/8 bg-[#0a0a0e] text-[11px] text-slate-500 text-center">
          Persisted securely in MongoDB • Checkpoint resumption enabled
        </div>

      </div>
    </div>
  );
};
