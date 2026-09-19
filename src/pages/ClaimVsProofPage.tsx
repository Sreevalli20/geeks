import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Terminal,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const ClaimVsProofPage: React.FC = () => {
  const {
    claims,
    skills,
    evidence,
    activeCandidate,
    navigateTo,
    setPreviewEvidence,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'VERIFIED' | 'PARTIAL' | 'DISCREPANCY' | 'UNVERIFIED'>('ALL');

  const candidateClaims = activeCandidate
    ? claims.filter((c) => c.candidateId === activeCandidate.id)
    : claims;

  if (candidateClaims.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Claim vs Proof Comparison Matrix</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            DON'T HIRE THE RESUME. HIRE THE PROOF.
          </p>
        </div>
        <EmptyState title="NO CLAIMS AVAILABLE FOR COMPARISON" description="Upload a candidate resume to generate the signature side-by-side Claim vs Proof matrix." />
      </div>
    );
  }

  // Build the comparison matrix items
  const matrixItems = candidateClaims.map((claim) => {
    const matchedEvidence = evidence.filter((e) => claim.evidenceIds.includes(e.id));
    const matchedSkill = skills.find(
      (s) => s.name.toLowerCase() === claim.title.toLowerCase() || claim.title.toLowerCase().includes(s.name.toLowerCase())
    );

    let proofVerdict: 'SUPPORTED' | 'PARTIALLY SUPPORTED' | 'CONFLICTING' | 'INSUFFICIENT' = 'INSUFFICIENT';
    let proofExplanation = '';
    let proofEvidenceSnippet = '';

    if (claim.evidenceStatus === 'Supported') {
      proofVerdict = 'SUPPORTED';
      proofExplanation = `Verified: Submissions contain production-grade code artifacts or valid RFC architectural docs confirming practical mastery.`;
      proofEvidenceSnippet = matchedEvidence.map((e) => e.filename).join(', ') || 'Submitted repository code verified.';
    } else if (claim.evidenceStatus === 'Partially Supported') {
      proofVerdict = 'PARTIALLY SUPPORTED';
      proofExplanation = `Partial Proof: Code exists demonstrating basic familiarity, but lacks production scale, tests, or distributed deployment evidence.`;
      proofEvidenceSnippet = matchedEvidence.map((e) => e.filename).join(', ') || 'Initial repo scripts found.';
    } else if (claim.evidenceStatus === 'Conflicting') {
      proofVerdict = 'CONFLICTING';
      proofExplanation = `Discrepancy: Candidate claimed ownership or senior leadership, but source commit history or documentation reveals only minor contributor or disparate timeline.`;
      proofEvidenceSnippet = 'Commit authorship discrepancy detected in repository metadata.';
    } else {
      proofVerdict = 'INSUFFICIENT';
      proofExplanation = `No Technical Proof Found: Zero code repositories, commit logs, or architectural artifacts back this claim. Requires practical challenge.`;
      proofEvidenceSnippet = 'No artifacts present in evidence vault.';
    }

    return {
      claim,
      matchedEvidence,
      matchedSkill,
      proofVerdict,
      proofExplanation,
      proofEvidenceSnippet,
    };
  });

  const filteredMatrix = matrixItems.filter((item) => {
    if (selectedFilter === 'VERIFIED') return item.proofVerdict === 'SUPPORTED';
    if (selectedFilter === 'PARTIAL') return item.proofVerdict === 'PARTIALLY SUPPORTED';
    if (selectedFilter === 'DISCREPANCY') return item.proofVerdict === 'CONFLICTING';
    if (selectedFilter === 'UNVERIFIED') return item.proofVerdict === 'INSUFFICIENT';
    return true;
  });

  return (
    <div id="claim-vs-proof-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-slate-900 text-white">
              <GitCompare className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Claim vs Proof Comparison Matrix
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              Signature Proof Engine
            </span>
          </div>
          <p className="text-xs text-slate-600 font-mono">
            A resume tells recruiters what a candidate CLAIMS. SkillProof reveals what they can PROVE.
          </p>
        </div>

        {activeCandidate && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-3">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Comparing Candidate</span>
              <span className="font-bold text-slate-900 text-sm">{activeCandidate.name}</span>
            </div>
            <button
              onClick={() => navigateTo('challenges')}
              className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Assign Challenge</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Comparisons ({matrixItems.length})
        </button>
        <button
          onClick={() => setSelectedFilter('VERIFIED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedFilter === 'VERIFIED'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ✓ Fully Verified Proof ({matrixItems.filter((i) => i.proofVerdict === 'SUPPORTED').length})
        </button>
        <button
          onClick={() => setSelectedFilter('PARTIAL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedFilter === 'PARTIAL'
              ? 'bg-sky-800 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Partially Supported ({matrixItems.filter((i) => i.proofVerdict === 'PARTIALLY SUPPORTED').length})
        </button>
        <button
          onClick={() => setSelectedFilter('DISCREPANCY')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedFilter === 'DISCREPANCY'
              ? 'bg-rose-800 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ⚠ Discrepancies & Conflicts ({matrixItems.filter((i) => i.proofVerdict === 'CONFLICTING').length})
        </button>
        <button
          onClick={() => setSelectedFilter('UNVERIFIED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedFilter === 'UNVERIFIED'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Needs Proof ({matrixItems.filter((i) => i.proofVerdict === 'INSUFFICIENT').length})
        </button>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="space-y-4">
        {filteredMatrix.map((item, idx) => {
          const isVerified = item.proofVerdict === 'SUPPORTED';
          const isConflicting = item.proofVerdict === 'CONFLICTING';
          const isPartial = item.proofVerdict === 'PARTIALLY SUPPORTED';

          return (
            <div
              key={item.claim.id}
              id={`claim-vs-proof-card-${item.claim.id}`}
              className={`bg-white rounded-xl border transition-all duration-150 overflow-hidden shadow-2xs ${
                isConflicting
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isVerified
                  ? 'border-emerald-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">#{idx + 1}</span>
                  <span className="text-xs font-bold text-slate-900">{item.claim.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-slate-200 text-slate-700">
                    {item.claim.claimType}
                  </span>
                </div>

                <StatusBadge status={item.proofVerdict} size="md" />
              </div>

              {/* Card Body: Side-by-Side Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-5 gap-5">
                {/* Left: What the Resume Claims */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      What the Resume Claims
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">Source: {item.claim.source}</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-900 font-semibold leading-relaxed">
                      "{item.claim.description}"
                    </p>
                    {item.claim.declaredLevel && item.claim.declaredLevel !== 'Not Specified' && (
                      <span className="inline-block mt-2 text-[10px] font-mono font-medium px-2 py-0.5 rounded-sm bg-slate-200 text-slate-700">
                        Self-Declared Level: {item.claim.declaredLevel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: What the Proof Actually Shows */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isVerified
                            ? 'bg-emerald-500'
                            : isConflicting
                            ? 'bg-rose-500'
                            : isPartial
                            ? 'bg-sky-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span
                        className={
                          isVerified
                            ? 'text-emerald-900'
                            : isConflicting
                            ? 'text-rose-900'
                            : isPartial
                            ? 'text-sky-900'
                            : 'text-amber-900'
                        }
                      >
                        What the Proof Actually Shows
                      </span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">Explainable Audit</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-lg border ${
                      isVerified
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : isConflicting
                        ? 'bg-rose-50/70 border-rose-200'
                        : isPartial
                        ? 'bg-sky-50/70 border-sky-200'
                        : 'bg-amber-50/70 border-amber-200'
                    }`}
                  >
                    <p
                      className={`text-xs font-medium leading-relaxed ${
                        isVerified
                          ? 'text-emerald-950'
                          : isConflicting
                          ? 'text-rose-950'
                          : isPartial
                          ? 'text-sky-950'
                          : 'text-amber-950'
                      }`}
                    >
                      {item.proofExplanation}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">Evidence Artifacts:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {item.proofEvidenceSnippet}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Ribbon */}
              <div className="px-5 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {item.matchedEvidence.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => setPreviewEvidence(ev)}
                      className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                    >
                      <FileCheck2 className="w-3 h-3 text-emerald-600" />
                      <span>{ev.filename}</span>
                    </button>
                  ))}
                </div>

                {!isVerified && (
                  <button
                    onClick={() => navigateTo('challenges')}
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold"
                  >
                    <span>Validate with Practical Challenge</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
