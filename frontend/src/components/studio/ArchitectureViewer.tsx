import React from 'react';
import { Database, ShieldCheck, FileCode, CheckCircle2, Lock, Key } from 'lucide-react';
import { SystemArchitecture } from '../../types';

interface Props {
  architecture: SystemArchitecture | null;
}

export const ArchitectureViewer: React.FC<Props> = ({ architecture }) => {
  if (!architecture) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Database className="h-12 w-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-semibold text-slate-300">No Architecture Spec Available Yet</h3>
        <p className="text-sm text-slate-500 max-w-md mt-1">
          Launch a workflow in the Studio to generate automated database schemas, ERDs, and OpenAPI specifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Overview Banner */}
      <div className="rounded-2xl border border-white/10 bg-[#161620]/80 p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              <Database className="h-3.5 w-3.5" /> {architecture.database_schema.database_engine} • {architecture.database_schema.orm}
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white">{architecture.project_name}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{architecture.tagline}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2 border border-white/8 text-xs font-mono text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Pydantic v2 • Strict Clean Architecture</span>
          </div>
        </div>
      </div>

      {/* Relational Database Entities (ERD Tables) */}
      <div>
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-[#ff6b35]" /> Database Entity Relationship Schema ({architecture.database_schema.tables.length} Tables)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {architecture.database_schema.tables.map((table) => (
            <div
              key={table.table_name}
              className="rounded-2xl border border-white/10 bg-[#14141c] p-5 shadow-lg transition-all hover:border-white/20"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <span className="font-mono text-sm font-bold text-blue-400">
                  {table.table_name}
                </span>
                <span className="text-[11px] text-slate-500 font-sans">
                  {table.columns.length} columns
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{table.description}</p>
              
              <div className="space-y-1.5 font-mono text-xs">
                {table.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      {col.primary_key ? (
                        <Key className="h-3 w-3 text-amber-400" />
                      ) : col.foreign_key ? (
                        <Lock className="h-3 w-3 text-cyan-400" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                      )}
                      <span className={col.primary_key ? 'font-bold text-amber-300' : ''}>
                        {col.name}
                      </span>
                    </div>
                    <span className="text-slate-500">{col.data_type}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OpenAPI REST API Endpoints */}
      <div>
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <FileCode className="h-4 w-4 text-emerald-400" /> REST API Endpoints ({architecture.api_specification.endpoints.length} Endpoints)
        </h3>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#14141c]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.04] text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Endpoint Path</th>
                  <th className="px-5 py-3">Summary</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-mono text-slate-300">
                {architecture.api_specification.endpoints.map((ep, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          ep.method === 'GET'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ep.method === 'POST'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : ep.method === 'DELETE'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white">{ep.path}</td>
                    <td className="px-5 py-3.5 font-sans text-slate-400">{ep.summary}</td>
                    <td className="px-5 py-3.5 text-slate-400">{ep.status_code}</td>
                    <td className="px-5 py-3.5 font-sans">
                      {ep.auth_required ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="h-3 w-3" /> Required
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Public</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
