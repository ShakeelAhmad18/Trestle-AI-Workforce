import React, { useState } from 'react';
import { FileCode, Copy, Check, Folder, File } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setSelectedCodeFile } from '../../store/uiSlice';

export const CodeEditorView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { generatedCodebase, testSuite } = useAppSelector((state) => state.workflow);
  const selectedCodeFile = useAppSelector((state) => state.ui.selectedCodeFile);
  const [copied, setCopied] = useState(false);

  const allFiles = { ...generatedCodebase, ...testSuite };
  const fileKeys = Object.keys(allFiles);

  const currentContent = allFiles[selectedCodeFile] || (fileKeys.length > 0 ? allFiles[fileKeys[0]] : '// No code generated yet.');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (fileKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <FileCode className="h-12 w-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-semibold text-slate-300">Codebase Not Yet Generated</h3>
        <p className="text-sm text-slate-500 max-w-md mt-1">
          Once the architecture is approved, the Developer Agent (Claude Sonnet 4.6) will generate full Clean Architecture files and Pytest test suites here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[640px] rounded-2xl border border-white/10 bg-[#0d0e14] overflow-hidden">
      
      {/* File Tree Explorer (Left Column) */}
      <div className="md:col-span-1 border-r border-white/8 bg-[#101017] p-3 overflow-y-auto">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Folder className="h-3.5 w-3.5 text-[#ff6b35]" /> Project Files ({fileKeys.length})
        </div>
        <div className="mt-2 space-y-1">
          {fileKeys.map((path) => {
            const isSelected = path === selectedCodeFile;
            return (
              <button
                key={path}
                onClick={() => dispatch(setSelectedCodeFile(path))}
                className={`w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left font-mono text-xs transition-all ${
                  isSelected
                    ? 'bg-[#ff6b35]/15 text-[#ff8c5a] border border-[#ff6b35]/30 font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <File className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{path}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Viewer Panel (Right Column) */}
      <div className="md:col-span-3 flex flex-col bg-[#0b0c10] overflow-hidden">
        {/* Editor Tab Header */}
        <div className="flex items-center justify-between border-b border-white/8 bg-[#12131a] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-slate-200">
              {selectedCodeFile}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300 hover:bg-white/[0.08] transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Code Content View */}
        <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-200">
          <pre>
            <code>{currentContent}</code>
          </pre>
        </div>
      </div>

    </div>
  );
};
