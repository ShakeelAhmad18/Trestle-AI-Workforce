import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  Clock,
  Database,
  FileCode,
  Terminal,
  GitBranch,
  Search,
  Bot,
  Zap,
  Lock,
  Download,
  FolderGit2,
  Plus,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  startWorkflow,
  fetchWorkflowStatus,
  setPrompt,
  resetActiveSession,
  toggleHistoryDrawer,
  downloadProjectZip,
  resumeWorkflow,
  fetchProjectHistory,
} from '../../store/workflowSlice';
import { openAuthModal } from '../../store/authSlice';
import { setActiveStudioTab } from '../../store/uiSlice';
import { ArchitectureViewer } from './ArchitectureViewer';
import { CodeEditorView } from './CodeEditorView';
import { TerminalView } from './TerminalView';
import { DeliveryCard } from './DeliveryCard';
import { HumanApprovalModal } from './HumanApprovalModal';
import { ProjectHistoryDrawer } from './ProjectHistoryDrawer';

export const AgentStudio: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    threadId,
    prompt,
    status,
    currentStep,
    researchReport,
    architectureSpec,
    generatedCodebase,
    testResults,
    deliveryInfo,
    isLoading,
    projectHistory,
    isDownloadingZip,
  } = useAppSelector((state) => state.workflow);
  const { agents } = useAppSelector((state) => state.agents);
  const { user, token } = useAppSelector((state) => state.auth);
  const activeTab = useAppSelector((state) => state.ui.activeStudioTab);

  const [inputPrompt, setInputPrompt] = useState(
    prompt || 'Build a multi-tenant SaaS project management backend with task assignments, priority levels, and audit logs.'
  );
  const [autoApprove, setAutoApprove] = useState(false);

  const PRESET_TEMPLATES = [
    { label: 'Multi-Tenant SaaS', text: 'Build a multi-tenant SaaS project management backend with task assignments, priority levels, and audit logs.' },
    { label: 'Real-Time Whiteboard API', text: 'Build a real-time collaborative whiteboard API backend with websocket channels, user authentication, and board persistence.' },
    { label: 'FinTech Payment Gateway', text: 'Build an enterprise payment gateway API with transaction ledgers, idempotent checkout endpoints, and Stripe webhook handling.' },
    { label: 'AI Document Parser', text: 'Build an AI document parser API with JWT authentication, file upload processing, vector embeddings, and Slowapi rate limiting.' },
  ];

  const PIPELINE_STEPS = [
    { id: 'supervisor', label: '1. Supervisor', role: 'Router' },
    { id: 'researcher', label: '2. Researcher', role: 'Tavily API' },
    { id: 'architect', label: '3. Architect', role: 'Pydantic v2' },
    { id: 'human_review', label: '4. Human Review', role: 'Interrupt' },
    { id: 'developer', label: '5. Developer', role: 'Claude Sonnet 4.6' },
    { id: 'sandbox_tester', label: '6. Sandbox QA', role: 'Firecracker' },
    { id: 'delivery', label: '7. Delivery', role: 'PyGithub' },
  ];

  // Fetch user project history on load
  useEffect(() => {
    if (token && user?.is_verified) {
      dispatch(fetchProjectHistory());
    }
  }, [token, user, dispatch]);

  // Keep inputPrompt synced with active session prompt
  useEffect(() => {
    if (prompt) {
      setInputPrompt(prompt);
    }
  }, [prompt]);

  // Polling loop when workflow is running
  useEffect(() => {
    let interval: any;
    if (threadId && (status === 'running' || status === 'testing' || status === 'fixing')) {
      interval = setInterval(() => {
        dispatch(fetchWorkflowStatus(threadId));
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [threadId, status, dispatch]);

  const handleLaunch = () => {
    if (!inputPrompt.trim()) return;

    if (!token || !user) {
      dispatch(openAuthModal('register'));
      return;
    }

    if (!user.is_verified) {
      dispatch(openAuthModal('verify'));
      return;
    }

    dispatch(setPrompt(inputPrompt));
    dispatch(startWorkflow({ prompt: inputPrompt, autoApprove }));
    dispatch(setActiveStudioTab('swarm'));
  };

  const handleResumeInterrupted = () => {
    if (threadId) {
      dispatch(resumeWorkflow(threadId));
    }
  };

  const handleDownloadZip = () => {
    if (threadId) {
      dispatch(downloadProjectZip(threadId));
    }
  };

  const getStepStatus = (stepId: string) => {
    const stepOrder = ['supervisor', 'researcher', 'architect', 'human_review', 'developer', 'sandbox_tester', 'delivery'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (status === 'delivered') return 'completed';
    if (currentIndex === stepIndex) return 'active';
    if (currentIndex > stepIndex) return 'completed';
    return 'pending';
  };

  const hasCodeGenerated = Object.keys(generatedCodebase).length > 0;

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Studio Header & Multi-Session Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 px-3 py-1 text-xs font-bold text-[#ff8c5a] uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5" /> Enterprise Agent Studio
          </div>
          <h1 className="text-3xl font-bold text-white mt-2">Autonomous Software Development Swarm</h1>
          <p className="text-sm text-slate-400 mt-1">
            Prompt the multi-agent graph to conduct market research, design relational ERDs, write clean code, and verify in E2B microVMs.
          </p>
        </div>

        {/* Global Multi-Session Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => dispatch(toggleHistoryDrawer())}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#14141c] px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all shadow-md"
          >
            <FolderGit2 className="h-4 w-4 text-[#ff8c5a]" />
            <span>History</span>
            {projectHistory.length > 0 && (
              <span className="rounded-full bg-[#ff6b35]/20 px-2 py-0.5 text-[10px] text-[#ff8c5a] font-bold">
                {projectHistory.length}
              </span>
            )}
          </button>

          <button
            onClick={() => dispatch(resetActiveSession())}
            className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all shadow-md"
          >
            <Plus className="h-4 w-4" /> New Session
          </button>

          {hasCodeGenerated && (
            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-lg"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloadingZip ? 'Archiving...' : 'Download Project .ZIP'}</span>
            </button>
          )}

          {threadId && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-[#14141c] border border-white/8 px-4 py-2.5 text-xs font-mono">
              <span className="text-slate-500">ID:</span>
              <span className="text-[#ff8c5a] font-bold">{threadId.slice(0, 8)}...</span>
              <span className={`inline-block h-2 w-2 rounded-full ${status === 'running' ? 'bg-amber-400 animate-ping' : status === 'delivered' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            </div>
          )}
        </div>
      </div>

      {/* Interrupted / Paused Checkpoint Resumption Banner */}
      {threadId && (status === 'paused_for_approval' || status === 'failed') && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {status === 'paused_for_approval' ? 'Workflow Paused at Checkpoint' : 'Interrupted Session Detected'}
              </h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {status === 'paused_for_approval'
                  ? 'The architecture is waiting for your review. You can review the ERD or resume execution.'
                  : 'This workflow stopped at the last saved node. Resume from this exact position without re-running earlier steps.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResumeInterrupted}
            className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition-colors shadow-lg"
          >
            <RotateCcw className="h-4 w-4" /> Resume From Checkpoint
          </button>
        </div>
      )}

      {/* Prompt Command Center */}
      <div className="rounded-3xl border border-white/12 bg-[#12121a] p-6 shadow-2xl backdrop-blur-xl">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Client Business Specification / Architecture Prompt
        </label>
        
        <div className="relative">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            rows={3}
            placeholder="Describe the software or API you want to autonomously architect, generate, test, and ship..."
            className="w-full rounded-2xl border border-white/12 bg-[#0a0a0d] p-4 text-sm text-white placeholder-slate-600 focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35] leading-relaxed"
          />
        </div>

        {/* Preset Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold mr-1">Presets:</span>
          {PRESET_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.label}
              onClick={() => setInputPrompt(tmpl.text)}
              className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              {tmpl.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/8">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-[#ff6b35] focus:ring-[#ff6b35]"
            />
            <span>Auto-Approve Architecture (Non-stop Execution)</span>
          </label>

          <button
            onClick={handleLaunch}
            disabled={isLoading || status === 'running'}
            className="btn-orange-glow inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-xl"
          >
            {token && user?.is_verified ? (
              <>
                <Play className="h-4 w-4" /> {isLoading ? 'Dispatching Swarm...' : 'Deploy AI Developer Agency'}
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Authenticate & Deploy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Multi-Agent Graph Live Progress Pipeline */}
      <div className="rounded-3xl border border-white/10 bg-[#14141c] p-6 shadow-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#ff6b35]" /> Multi-Agent Execution Graph (LangGraph StateGraph)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {PIPELINE_STEPS.map((step) => {
            const stepStatus = getStepStatus(step.id);
            return (
              <div
                key={step.id}
                className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all ${
                  stepStatus === 'active'
                    ? 'border-[#ff6b35] bg-[#ff6b35]/15 shadow-[0_0_20px_rgba(255,107,53,0.3)] ring-1 ring-[#ff6b35]'
                    : stepStatus === 'completed'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/8 bg-white/[0.02] text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-tight">{step.label}</span>
                  {stepStatus === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : stepStatus === 'active' ? (
                    <Clock className="h-4 w-4 text-[#ff6b35] animate-spin" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-700" />
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400">{step.role}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Studio Workspace Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          {[
            { id: 'swarm', label: 'Agent Workforce', icon: Bot },
            { id: 'research', label: 'Market Research', icon: Search, badge: researchReport ? 'Ready' : undefined },
            { id: 'architecture', label: 'Architecture & ERD', icon: Database, badge: architectureSpec ? 'Spec' : undefined },
            { id: 'code', label: 'Generated Codebase', icon: FileCode, badge: Object.keys(generatedCodebase).length > 0 ? `${Object.keys(generatedCodebase).length} files` : undefined },
            { id: 'terminal', label: 'E2B Sandbox Pytest', icon: Terminal, badge: testResults?.passed ? '100%' : undefined },
            { id: 'delivery', label: 'GitHub Delivery', icon: GitBranch, badge: deliveryInfo ? 'Shipped' : undefined },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => dispatch(setActiveStudioTab(tab.id as any))}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-lg font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${isActive ? 'bg-black/10 text-black' : 'bg-[#ff6b35]/20 text-[#ff8c5a]'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div>
          {activeTab === 'swarm' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-2xl border border-white/10 bg-[#14141c] p-5 shadow-lg flex flex-col justify-between hover:border-white/20 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={agent.avatar} alt={agent.name} className="h-12 w-12 rounded-full object-cover border border-white/10" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff8c5a]">{agent.role}</span>
                        <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{agent.description}</p>
                  </div>
                  <div className="pt-3 border-t border-white/8 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{agent.model}</span>
                    <span className="text-emerald-400">● Ready</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'research' && (
            <div className="rounded-3xl border border-white/10 bg-[#14141c] p-6 shadow-xl">
              {researchReport ? (
                <div className="space-y-6">
                  <div className="border-b border-white/8 pb-4">
                    <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      Market Domain: {researchReport.project_domain}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2">{researchReport.core_value_proposition}</h3>
                    <p className="text-xs text-slate-400 mt-1">Target Audience: {researchReport.target_audience}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-3">High-Demand Features Clients Pay For</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {researchReport.demanded_features.map((feat, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-xs">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white">{feat.name}</span>
                            <span className="rounded-md bg-[#ff6b35]/20 text-[#ff8c5a] px-2 py-0.5 text-[10px] font-bold">{feat.priority}</span>
                          </div>
                          <p className="text-slate-400 mb-2">{feat.description}</p>
                          <div className="text-[11px] text-slate-500 font-mono">Reason: {feat.market_demand_reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <Search className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Market research report will appear here once the Researcher Agent runs.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'architecture' && <ArchitectureViewer architecture={architectureSpec} />}
          {activeTab === 'code' && <CodeEditorView />}
          {activeTab === 'terminal' && <TerminalView />}
          {activeTab === 'delivery' && <DeliveryCard />}
        </div>
      </div>

      {/* Embedded Human Approval Checkpoint Modal */}
      <HumanApprovalModal />

      {/* Project History & Session Drawer */}
      <ProjectHistoryDrawer />

    </div>
  );
};
