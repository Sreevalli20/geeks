import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Award,
  FolderKanban,
  FileCheck2,
  AlertTriangle,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  Network,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const CandidatesPage: React.FC = () => {
  const {
    candidates,
    activeCandidate,
    setActiveCandidateId,
    navigateTo,
    deleteCandidate,
    skills,
    projects,
    evidence,
    claims,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('ALL');

  // Collect all unique skills across candidates
  const allUniqueSkills = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => c.keySkills.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [candidates]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.detectedRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSkill =
        selectedSkillFilter === 'ALL' ||
        c.keySkills.some((s) => s.toLowerCase() === selectedSkillFilter.toLowerCase());

      return matchesSearch && matchesSkill;
    });
  }, [candidates, searchTerm, selectedSkillFilter]);

  if (candidates.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Candidate Directory</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Ingested talent profiles backed by verifiable technical proof
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div id="candidates-directory-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Candidate Directory
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {candidates.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Auto-populated from uploaded resumes and ingested technical portfolios
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigateTo('import-center')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            Import JSON/CSV
          </button>
          <button
            onClick={() => navigateTo('upload-center')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            Upload New Resume
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-candidates"
            type="text"
            placeholder="Search candidates by name, detected role, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            id="select-skill-filter"
            value={selectedSkillFilter}
            onChange={(e) => setSelectedSkillFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Detected Skills</option>
            {allUniqueSkills.map((sk) => (
              <option key={sk} value={sk}>
                {sk}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCandidates.map((cand) => {
          const candClaims = claims.filter((c) => c.candidateId === cand.id);
          const candSkills = skills.filter((s) => s.candidateId === cand.id);
          const candProjects = projects.filter((p) => p.candidateId === cand.id);
          const candEvidence = evidence.filter((e) => e.candidateId === cand.id);

          const provenSkills = candSkills.filter((s) => s.isProven || s.verificationState === 'Supported');
          const hasConflicts = candClaims.some((c) => c.evidenceStatus === 'Conflicting');
          const isSelected = activeCandidate?.id === cand.id;

          // Explainable Proof Status
          const proofStatus =
            provenSkills.length >= 3
              ? 'SUPPORTED'
              : provenSkills.length > 0
              ? 'PARTIALLY SUPPORTED'
              : hasConflicts
              ? 'CONFLICTING'
              : 'INSUFFICIENT';

          return (
            <div
              key={cand.id}
              id={`candidate-card-${cand.id}`}
              className={`bg-white rounded-xl border transition-all duration-150 p-5 flex flex-col justify-between shadow-2xs ${
                isSelected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Name, Tag, Actions */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-950 line-clamp-1">{cand.name}</h3>
                      {cand.isDevelopmentData && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                          DEV DATA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium line-clamp-1">{cand.detectedRole}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{cand.email || 'Email Not Specified'}</p>
                  </div>

                  <StatusBadge status={proofStatus} size="sm" />
                </div>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 my-3 text-center">
                  <div className="p-1.5 rounded-md bg-slate-50">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Skills</span>
                    <span className="text-xs font-bold text-slate-800">
                      {provenSkills.length}/{candSkills.length}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-md bg-slate-50">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Projects</span>
                    <span className="text-xs font-bold text-slate-800">{candProjects.length}</span>
                  </div>
                  <div className="p-1.5 rounded-md bg-slate-50">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Evidence</span>
                    <span className="text-xs font-bold text-slate-800">{candEvidence.length} files</span>
                  </div>
                </div>

                {/* Key Skills */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold block mb-1.5">
                    Detected Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cand.keySkills.slice(0, 5).map((sk) => {
                      const isSkillProven = candSkills.some((s) => s.name.toLowerCase() === sk.toLowerCase() && (s.isProven || s.verificationState === 'Supported'));
                      return (
                        <span
                          key={sk}
                          className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                            isSkillProven
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isSkillProven && '✓ '}
                          {sk}
                        </span>
                      );
                    })}
                    {cand.keySkills.length > 5 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400">
                        +{cand.keySkills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  id={`btn-open-profile-${cand.id}`}
                  onClick={() => {
                    setActiveCandidateId(cand.id);
                    navigateTo('candidate-profile');
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id={`btn-open-graph-${cand.id}`}
                  onClick={() => {
                    setActiveCandidateId(cand.id);
                    navigateTo('evidence-graph');
                  }}
                  title="Trace on Evidence Graph"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Network className="w-4 h-4 text-indigo-600" />
                </button>

                {!cand.isDevelopmentData && (
                  <button
                    onClick={() => deleteCandidate(cand.id)}
                    title="Remove candidate record"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
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
