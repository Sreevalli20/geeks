import React, { useState } from 'react';
import {
  Award,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  Terminal,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const SkillsPage: React.FC = () => {
  const {
    skills,
    activeCandidate,
    evidence,
    navigateTo,
    setPreviewEvidence,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const candidateSkills = activeCandidate
    ? skills.filter((s) => s.candidateId === activeCandidate.id)
    : skills;

  const provenSkills = candidateSkills.filter((s) => s.isProven || s.verificationState === 'Supported');
  const unprovenSkills = candidateSkills.filter((s) => !s.isProven && s.verificationState !== 'Supported');

  const filteredSkills = candidateSkills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (candidateSkills.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Skills Inventory</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Claimed skills vs. verified proof
          </p>
        </div>
        <EmptyState title="NO SKILLS RECORDED YET" description="Upload a candidate resume to automatically extract claimed skills and match them to technical evidence." />
      </div>
    );
  }

  const categories = ['ALL', 'Language', 'Framework', 'Database', 'Cloud/DevOps', 'Tool', 'Architecture'];

  return (
    <div id="skills-inventory-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Skills Inventory & Proof Status
            </h1>
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {candidateSkills.length} Skills
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Strict separation: CLAIMED SKILLS (from resume) vs. PROVEN SKILLS (supported by code)
          </p>
        </div>

        {activeCandidate && (
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
            <span className="text-slate-500">Candidate:</span>
            <span className="font-bold text-slate-900">{activeCandidate.name}</span>
          </div>
        )}
      </div>

      {/* Claimed vs Proven Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Claimed on Resume
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">{candidateSkills.length} Total</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Asserted in text sections. Requires code, challenge, or artifact validation.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidateSkills.map((sk) => (
              <span
                key={sk.id}
                className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
              >
                {sk.name}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Proven Skills ({provenSkills.length})
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800">
              {Math.round((provenSkills.length / (candidateSkills.length || 1)) * 100)}% Verified
            </span>
          </div>
          <p className="text-xs text-emerald-700 mb-3">
            Backed by verified source code, architecture RFCs, or completed practical challenges.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {provenSkills.length === 0 ? (
              <span className="text-xs text-emerald-800 italic">No skills verified yet. Submit a practical challenge.</span>
            ) : (
              provenSkills.map((sk) => (
                <span
                  key={sk.id}
                  className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {sk.name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-skills"
            type="text"
            placeholder="Search skill name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Skills Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono">
            <tr>
              <th className="p-3.5">Skill & Category</th>
              <th className="p-3.5">Resume Claim</th>
              <th className="p-3.5">Evidence Strength</th>
              <th className="p-3.5">Verification State</th>
              <th className="p-3.5">Identified Proof Gap</th>
              <th className="p-3.5">Recommended Validation</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSkills.map((sk) => {
              const matchedEvidence = evidence.filter((e) => sk.relatedEvidenceIds.includes(e.id));

              return (
                <tr key={sk.id} className="hover:bg-slate-50/70">
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">{sk.name}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-600">
                      {sk.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 font-mono">
                    {sk.resumeClaimLevel}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                        sk.evidenceStrength === 'Production Grade'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : sk.evidenceStrength === 'High'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : sk.evidenceStrength === 'Moderate'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : sk.evidenceStrength === 'Weak'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {sk.evidenceStrength} ({sk.evidenceCount} files)
                    </span>
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={sk.verificationState} size="sm" />
                  </td>
                  <td className="p-3.5 text-slate-600 max-w-xs text-[11px] leading-relaxed">
                    {sk.missingProofReason || 'None'}
                  </td>
                  <td className="p-3.5 text-slate-800 font-medium text-[11px]">
                    {sk.recommendedValidation || 'Recruiter Review'}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    {sk.isProven ? (
                      <span className="text-emerald-700 font-semibold font-mono text-[11px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Proven
                      </span>
                    ) : (
                      <button
                        onClick={() => navigateTo('challenges')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>Validate</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
