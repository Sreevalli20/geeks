import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Award,
  Terminal,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { generateExplainableReport } from '../services/reports';

export const ReportsPage: React.FC = () => {
  const {
    activeCandidate,
    claims,
    skills,
    evidence,
    assessments,
  } = useApp();

  const [copied, setCopied] = useState(false);

  if (!activeCandidate) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Explainable Proof Report</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Executive dossier for hiring managers and recruiters
          </p>
        </div>
        <EmptyState title="NO ACTIVE CANDIDATE FOR REPORT" description="Select or upload a candidate to generate an Explainable Proof Dossier." />
      </div>
    );
  }

  const report = generateExplainableReport(
    activeCandidate,
    claims.filter((c) => c.candidateId === activeCandidate.id),
    skills.filter((s) => s.candidateId === activeCandidate.id),
    evidence.filter((e) => e.candidateId === activeCandidate.id),
    assessments.filter((a) => a.candidateId === activeCandidate.id)
  );

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SkillProof_${activeCandidate.name.replace(/\s+/g, '_')}_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `SkillProof Report: ${activeCandidate.name} (${activeCandidate.detectedRole})
Recommendation: ${report.executiveRecommendation}
Proof Confidence: ${report.proofScore}/100
Proven Skills: ${report.provenSkills.join(', ')}
Total Evidence Artifacts: ${report.evidenceBreakdown.totalCount}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="reports-view" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Explainable Proof Profile Dossier
            </h1>
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Audit-Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            DON'T HIRE THE RESUME. HIRE THE PROOF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copied ? 'Copied Summary!' : 'Share Summary'}</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold font-mono tracking-widest uppercase text-slate-400">
                SKILLPROOF VERIFICATION DOSSIER
              </span>
              {activeCandidate.isDevelopmentData && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800">
                  DEVELOPMENT DATA
                </span>
              )}
            </div>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">{activeCandidate.name}</h2>
            <p className="text-sm font-semibold text-slate-700 mt-1">{activeCandidate.detectedRole}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{activeCandidate.email} • ID: {activeCandidate.id}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0 min-w-[160px]">
            <span className="text-[10px] uppercase font-mono text-slate-500 block font-bold">
              Proof Confidence
            </span>
            <span className="text-3xl font-black text-slate-950 font-mono block my-1">
              {report.proofScore}/100
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">
              {report.proofScore >= 80 ? 'HIGH EVIDENCE RIGOR' : 'MODERATE PROOF'}
            </span>
          </div>
        </div>

        {/* Executive Recommendation */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Executive Hiring Recommendation</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {report.executiveRecommendation}
          </p>
        </div>

        {/* Proven vs Claimed Skills Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Skills Audit: Claimed vs Proven
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold uppercase text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified & Proven Skills ({report.provenSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {report.provenSkills.map((sk: string) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-mono font-bold border border-emerald-300"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200 space-y-2">
              <span className="text-xs font-bold uppercase text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Unverified Claims ({report.unprovenClaims.length})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {report.unprovenClaims.map((cl: string) => (
                  <span
                    key={cl}
                    className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-mono border border-amber-300"
                  >
                    {cl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Vault Inventory */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Evidence Vault Breakdown ({report.evidenceBreakdown.totalCount} Artifacts)
          </h3>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Source Code Repositories & Files</span>
              <span className="font-mono font-bold text-slate-900">
                {report.evidenceBreakdown.sourceCodeCount}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Technical Documentation & RFCs</span>
              <span className="font-mono font-bold text-slate-900">
                {report.evidenceBreakdown.documentationCount}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Verified Credentials & Certificates</span>
              <span className="font-mono font-bold text-slate-900">
                {report.evidenceBreakdown.certificateCount}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Completed Practical Challenges</span>
              <span className="font-mono font-bold text-slate-900">
                {report.evidenceBreakdown.challengeCount}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Provenance Stamp */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-mono">
          <span>Generated by SkillProof Evidence Engine</span>
          <span>Verified At: {new Date(report.generatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
