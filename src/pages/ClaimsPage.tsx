import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  UserCheck,
  Eye,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { ClaimType } from '../types';

export const ClaimsPage: React.FC = () => {
  const {
    claims,
    activeCandidate,
    evidence,
    markClaimReview,
    setPreviewEvidence,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');

  const candidateClaims = activeCandidate
    ? claims.filter((c) => c.candidateId === activeCandidate.id)
    : claims;

  const filteredClaims = candidateClaims.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypeFilter === 'ALL' || c.claimType === selectedTypeFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || c.evidenceStatus === selectedStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (candidateClaims.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Claim Engine</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Explicit claim objects extracted from resume assertions
          </p>
        </div>
        <EmptyState title="NO CLAIMS DETECTED YET" description="Upload a candidate resume to automatically decompose text assertions into explicit claim objects." />
      </div>
    );
  }

  const handleSaveReview = (claimId: string) => {
    markClaimReview(claimId, true, reviewNoteInput);
    setEditingClaimId(null);
    setReviewNoteInput('');
  };

  return (
    <div id="claims-engine-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">Claim Engine</h1>
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {candidateClaims.length} Claims
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            A resume tells recruiters what a candidate claims. Proof verifies it.
          </p>
        </div>

        {activeCandidate && (
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
            <span className="text-slate-500">Candidate:</span>
            <span className="font-bold text-slate-900">{activeCandidate.name}</span>
          </div>
        )}
      </div>

      {/* Distinction Banner: CLAIM vs EVIDENCE vs VERIFICATION vs HUMAN REVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">1. CLAIM</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block">Unverified Assertion</span>
          <span className="text-[11px] text-slate-500">Extracted from resume</span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">2. EVIDENCE</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block">Technical Artifacts</span>
          <span className="text-[11px] text-slate-500">Code, RFCs, badges</span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">3. VERIFICATION</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block">Explainable Match</span>
          <span className="text-[11px] text-slate-500">Cross-artifact validation</span>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">4. HUMAN REVIEW</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block">Recruiter Audit</span>
          <span className="text-[11px] text-slate-500">Auditable human sign-off</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-claims"
            type="text"
            placeholder="Search claim title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="select-claim-type"
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Claim Types</option>
            <option value="Technical Skill">Technical Skill</option>
            <option value="Project Achievement">Project Achievement</option>
            <option value="Work Experience">Work Experience</option>
            <option value="Certification">Certification</option>
          </select>

          <select
            id="select-claim-status"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Evidence Statuses</option>
            <option value="Supported">Supported</option>
            <option value="Partially Supported">Partially Supported</option>
            <option value="Insufficient Evidence">Insufficient Evidence</option>
            <option value="Conflicting">Conflicting</option>
            <option value="Unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {filteredClaims.map((claim) => {
          const matchedEvidence = evidence.filter((e) => claim.evidenceIds.includes(e.id));
          const isEditing = editingClaimId === claim.id;

          return (
            <div
              key={claim.id}
              id={`claim-card-${claim.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-950">{claim.title}</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                      {claim.claimType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Source: {claim.source}
                    </span>
                    {claim.declaredLevel && claim.declaredLevel !== 'Not Specified' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                        Level: {claim.declaredLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{claim.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <StatusBadge status={claim.evidenceStatus} size="md" />
                </div>
              </div>

              {/* Connected Evidence Section */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-500 font-mono text-[11px]">
                    Supporting Evidence:
                  </span>
                  {matchedEvidence.length === 0 ? (
                    <span className="text-amber-700 font-mono text-[11px] bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                      None linked • Requires technical artifact
                    </span>
                  ) : (
                    matchedEvidence.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setPreviewEvidence(ev)}
                        className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                      >
                        <FileCheck2 className="w-3 h-3 text-emerald-600" />
                        <span className="max-w-[120px] truncate">{ev.filename}</span>
                      </button>
                    ))
                  )}
                </div>

                {/* Human Review Status & Trigger */}
                <div className="flex items-center gap-2">
                  {claim.reviewedByHuman ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      Audited by Recruiter
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingClaimId(claim.id);
                        setReviewNoteInput(claim.reviewerNotes || '');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-sm transition-colors"
                    >
                      <UserCheck className="w-3 h-3" />
                      Sign Off / Review
                    </button>
                  )}
                </div>
              </div>

              {/* Reviewer Note if present */}
              {claim.reviewerNotes && (
                <div className="mt-2.5 p-2 bg-slate-50 rounded-md border border-slate-200 text-[11px] text-slate-700 font-mono">
                  <span className="font-bold text-slate-900 mr-1.5">Audit Note:</span>
                  {claim.reviewerNotes}
                </div>
              )}

              {/* Inline Review Edit Form */}
              {isEditing && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-300 space-y-2">
                  <label className="block text-xs font-semibold text-slate-800">
                    Add Recruiter Audit Note for "{claim.title}"
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified against submitted code PR; claims align with real commits."
                    value={reviewNoteInput}
                    onChange={(e) => setReviewNoteInput(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md focus:outline-hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveReview(claim.id)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold"
                    >
                      Save Sign-off
                    </button>
                    <button
                      onClick={() => setEditingClaimId(null)}
                      className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
