import React from 'react';
import { Terminal, CheckCircle2, XCircle, RotateCcw, Cpu } from 'lucide-react';
import { useAppSelector } from '../../store';

export const TerminalView: React.FC = () => {
  const { testResults, retryCount, errorLogs } = useAppSelector((state) => state.workflow);

  if (!testResults && errorLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Terminal className="h-12 w-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-semibold text-slate-300">E2B Firecracker MicroVM Idle</h3>
        <p className="text-sm text-slate-500 max-w-md mt-1">
          Once code is generated, the Sandbox QA Tester agent spins up an isolated Firecracker microVM to run `pip install` and `pytest tests/ -v`.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Test Execution Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#14141c] p-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              testResults?.passed
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            {testResults?.passed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {testResults?.passed ? 'All Pytest Suites Passed 100%' : 'Test Failures Encountered'}
            </h4>
            <p className="text-xs text-slate-400">
              E2B Firecracker Sandbox microVM execution • {testResults?.test_count || 0} tests verified
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="rounded-lg bg-white/[0.04] px-3 py-1.5 border border-white/8 text-slate-300">
            Exit Code: <span className="text-emerald-400">{testResults?.exit_code ?? 0}</span>
          </div>
          {retryCount > 0 && (
            <div className="rounded-lg bg-amber-500/10 px-3 py-1.5 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5 animate-spin" /> Fix Loops: {retryCount}
            </div>
          )}
        </div>
      </div>

      {/* Terminal Console Output */}
      <div className="rounded-2xl border border-white/10 bg-[#090a0e] p-4 font-mono text-xs shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 pb-3 mb-3 text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/60" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <span className="h-3 w-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-slate-400">e2b-sandbox-microvm:~/workspace$ pytest tests/ -v</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" /> Firecracker v1.7.0
          </span>
        </div>

        {/* Stdout Output */}
        {testResults?.stdout && (
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {testResults.stdout}
          </div>
        )}

        {/* Stderr Logs / Traceback */}
        {testResults?.stderr && (
          <div className="mt-4 text-red-400 whitespace-pre-wrap border-t border-red-500/20 pt-3">
            {testResults.stderr}
          </div>
        )}
      </div>

    </div>
  );
};
