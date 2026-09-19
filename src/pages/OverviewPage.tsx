import React from 'react';
import {
  Users,
  ShieldAlert,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  UploadCloud,
  FileSpreadsheet,
  GitCompare,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const OverviewPage: React.FC = () => {
  const {
    candidates,
    claims,
    skills,
    evidence,
    challenges,
    submissions,
    activeCandidate,
    navigateTo,
  } = useApp();

  if (candidates.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">Overview Dashboard</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Evidence-based hiring intelligence • Zero manual data entry
            </p>
          </div>
        </div>
        <EmptyState />
      </div>
    );
  }

  // Application-derived metrics from real state
  const totalCandidates = candidates.length;
  const totalClaims = claims.length;
  const totalEvidence = evidence.length;

  const supportedSkillsCount = skills.filter(
    (s) => s.verificationState === 'Supported' || s.isProven
  ).length;

  const requiringReviewCount = claims.filter(
    (c) => c.evidenceStatus === 'Requires Human Review' || c.reviewedByHuman === false
  ).length;

  const conflictingEvidenceCount = claims.filter(
    (c) => c.evidenceStatus === 'Conflicting'
  ).length + evidence.filter((e) => e.status === 'CONFLICTING').length;

  const pendingValidationCount = skills.filter(
    (s) => s.verificationState === 'Insufficient Evidence' || s.verificationState === 'Not Yet Verified'
  ).length;

  // Active candidate specific metrics
  const candidateClaims = activeCandidate ? claims.filter((c) => c.candidateId === activeCandidate.id) : claims;
  const candidateSkills = activeCandidate ? skills.filter((s) => s.candidateId === activeCandidate.id) : skills;
  const candidateEvidence = activeCandidate ? evidence.filter((e) => e.candidateId === activeCandidate.id) : evidence;
  const candidateSubmissions = activeCandidate ? submissions.filter((s) => s.candidateId === activeCandidate.id) : submissions;

  const candidateProvenSkills = candidateSkills.filter((s) => s.isProven || s.verificationState === 'Supported');

  return (
    <div id="overview-dashboard-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Evidence-Based Hiring Intelligence
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Live State
            </span>
          </div>
          <p className="text-xs text-slate-600 font-mono">
            DON'T HIRE THE RESUME. HIRE THE PROOF.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-overview-import"
            onClick={() => navigateTo('import-center')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            Import Records
          </button>

          <button
            id="btn-overview-upload"
            onClick={() => navigateTo('upload-center')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            Upload Candidate Resume
          </button>
        </div>
      </div>

      {/* Development Data Notice if preview candidate active */}
      {activeCandidate?.isDevelopmentData && (
        <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/70 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 uppercase tracking-wide mr-2">
                DEVELOPMENT DATA:
              </span>
              <span className="text-amber-800">
                You are previewing sample candidate <strong>{activeCandidate.name}</strong> to inspect proof mechanics.
                Uploaded resumes immediately replace or augment this dataset.
              </span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('upload-center')}
            className="text-amber-900 font-semibold underline shrink-0 hover:text-amber-950"
          >
            Upload Real Resume →
          </button>
        </div>
      )}

      {/* Application-Derived Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Candidates</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-950">{totalCandidates}</div>
          <span className="text-[10px] text-slate-500">Processed</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Claims</span>
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-950">{totalClaims}</div>
          <span className="text-[10px] text-slate-500">Explicit claims</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Evidence</span>
            <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-950">{totalEvidence}</div>
          <span className="text-[10px] text-slate-500">Artifacts linked</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Supported</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{supportedSkillsCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Proven skills</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Pending</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{pendingValidationCount}</div>
          <span className="text-[10px] text-amber-600">Needs proof</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Conflicts</span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{conflictingEvidenceCount}</div>
          <span className="text-[10px] text-rose-600">Discrepancies</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-purple-600 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">Audit</span>
            <AlertTriangle className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700">{requiringReviewCount}</div>
          <span className="text-[10px] text-purple-600">Human review</span>
        </div>
      </div>

      {/* Main Focus: Active Candidate Proof Profile Overview */}
      {activeCandidate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate Overview Card */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{activeCandidate.name}</h2>
                  {activeCandidate.isDevelopmentData && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800">
                      DEV DATA
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{activeCandidate.detectedRole}</p>
                <p className="text-xs text-slate-500 mt-1">{activeCandidate.summary}</p>
              </div>

              <button
                id="btn-open-claim-vs-proof"
                onClick={() => navigateTo('claim-vs-proof')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shrink-0"
              >
                <span>Claim vs Proof</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Claimed vs Proven Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Claimed Skills ({candidateSkills.length})
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">From Resume</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidateSkills.map((sk) => (
                    <span
                      key={sk.id}
                      className="px-2 py-1 rounded-md text-xs font-mono bg-white border border-slate-200 text-slate-700"
                    >
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Proven Skills ({candidateProvenSkills.length})
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                    Code / Challenge Verified
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidateProvenSkills.length === 0 ? (
                    <p className="text-xs text-emerald-700 italic">No skills verified yet.</p>
                  ) : (
                    candidateProvenSkills.map((sk) => (
                      <span
                        key={sk.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {sk.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Claims Audit Table */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Key Resume Claims & Verification State
                </h3>
                <button
                  onClick={() => navigateTo('claims')}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
                >
                  View all claims ({candidateClaims.length}) →
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium font-mono">
                    <tr>
                      <th className="p-2.5">Claim</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Evidence Status</th>
                      <th className="p-2.5">Supporting Artifacts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {candidateClaims.slice(0, 4).map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-50/70">
                        <td className="p-2.5 font-semibold text-slate-900 max-w-xs truncate">
                          {claim.title}
                        </td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">{claim.claimType}</td>
                        <td className="p-2.5">
                          <StatusBadge status={claim.evidenceStatus} size="sm" />
                        </td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                          {claim.evidenceIds.length} file(s) linked
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions & Validation Sidebar */}
          <div className="space-y-4">
            {/* Practical Validation Recommendation Card */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold">Practical Validation Engine</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Candidate has unverified skill claims. Assign role-specific coding challenges to transform claims into proof.
              </p>

              <div className="space-y-2 pt-1">
                {challenges.slice(0, 2).map((chal) => (
                  <div
                    key={chal.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{chal.skillTested}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-slate-200 text-slate-700">
                        {chal.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{chal.title}</p>
                  </div>
                ))}
              </div>

              <button
                id="btn-goto-practical-challenges"
                onClick={() => navigateTo('challenges')}
                className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch Practical Challenges</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Evidence Vault Quick Stats */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold">Evidence Vault</h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {candidateEvidence.length} items
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Source Code Files</span>
                  <span className="font-mono font-medium">
                    {candidateEvidence.filter((e) => e.evidenceType === 'Source Code').length}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Documentation / RFCs</span>
                  <span className="font-mono font-medium">
                    {candidateEvidence.filter((e) => e.evidenceType === 'Documentation').length}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Certificates / Credentials</span>
                  <span className="font-mono font-medium">
                    {candidateEvidence.filter((e) => e.evidenceType === 'Certificate').length}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Practical Challenges</span>
                  <span className="font-mono font-medium">
                    {candidateEvidence.filter((e) => e.evidenceType === 'Practical Challenge').length}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigateTo('evidence')}
                className="w-full py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                Inspect All Evidence Artifacts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
