import React, { useState } from 'react';
import {
  ShieldCheck,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Lock,
  Download,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const VerificationPage: React.FC = () => {
  const {
    claims,
    evidence,
    auditLogs,
    activeCandidate,
    markClaimReview,
  } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'AUDIT' | 'CONFLICT' | 'OVERRIDE'>('ALL');

  const candidateClaims = activeCandidate
    ? claims.filter((c) => c.candidateId === activeCandidate.id)
    : claims;
  const candidateEvidence = activeCandidate
    ? evidence.filter((e) => e.candidateId === activeCandidate.id)
    : evidence;

  const conflicts = candidateClaims.filter((c) => c.evidenceStatus === 'Conflicting');
  const humanAuditedClaims = candidateClaims.filter((c) => c.reviewedByHuman);

  if (candidateClaims.length === 0 && auditLogs.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Verification & Audit Log</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Tamper-evident proof provenance & reviewer audits
          </p>
        </div>
        <EmptyState title="NO VERIFICATION RECORDS" description="Upload candidate records to generate verifiable audit provenance." />
      </div>
    );
  }

  return (
    <div id="verification-audit-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Verification & Audit Provenance
            </h1>
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              Tamper-Evident
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Explainable audit trails, conflict resolutions, and recruiter human sign-offs
          </p>
        </div>

        {activeCandidate && (
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
            <span className="text-slate-500">Candidate:</span>
            <span className="font-bold text-slate-900">{activeCandidate.name}</span>
          </div>
        )}
      </div>

      {/* Discrepancy / Conflict Alert Box if present */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/80 space-y-2">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Active Evidence Discrepancies ({conflicts.length})</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            The platform identified contradictory assertions between the candidate's resume and submitted repository evidence.
          </p>
          <div className="space-y-1.5 pt-1">
            {conflicts.map((c) => (
              <div key={c.id} className="p-2.5 rounded-md bg-white border border-rose-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-950">{c.title}</span>
                  <p className="text-[11px] text-rose-800 mt-0.5">{c.description}</p>
                </div>
                <StatusBadge status="CONFLICTING" size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Human Review & Recruiter Audit Ledger ({humanAuditedClaims.length})
            </h3>
            <p className="text-xs text-slate-500">
              Auditable sign-offs guaranteeing recruiter accountability
            </p>
          </div>

          <div className="text-xs font-mono text-slate-500">
            {humanAuditedClaims.length} of {candidateClaims.length} Claims Audited
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono">
              <tr>
                <th className="p-3">Claim</th>
                <th className="p-3">Evidence State</th>
                <th className="p-3">Auditor Note</th>
                <th className="p-3">Audit Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidateClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50/70">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{claim.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{claim.claimType}</span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={claim.evidenceStatus} size="sm" />
                  </td>
                  <td className="p-3 text-slate-700 font-mono text-[11px]">
                    {claim.reviewerNotes || 'Pending Recruiter Sign-off'}
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                    {claim.reviewedAt ? new Date(claim.reviewedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => markClaimReview(claim.id, true, 'Recruiter verified artifact validity.')}
                      className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
                    >
                      {claim.reviewedByHuman ? 'Re-Audit' : 'Sign Off'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Provenance Logs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Immutable Provenance Log ({auditLogs.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Chronological Event Trail</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {auditLogs.map((log: any) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between font-mono"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-xs bg-slate-200 text-slate-700 font-bold">
                  {log.action || log.eventType}
                </span>
                <span className="text-slate-800 font-medium">{log.details}</span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
