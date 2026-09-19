import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  FileCode,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  Eye,
  CheckCircle2,
  UploadCloud,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { EvidenceCategory, VerificationStatus } from '../types';

export const EvidenceCenterPage: React.FC = () => {
  const {
    evidence,
    activeCandidate,
    skills,
    projects,
    setPreviewEvidence,
    updateEvidenceStatus,
    navigateTo,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const candidateEvidence = activeCandidate
    ? evidence.filter((e) => e.candidateId === activeCandidate.id)
    : evidence;

  const categories: string[] = [
    'ALL',
    'Resume',
    'Source Code',
    'Documentation',
    'Certificate',
    'Screenshot',
    'Practical Challenge',
    'Project',
    'Assessment',
  ];

  const filteredEvidence = useMemo(() => {
    return candidateEvidence.filter((e) => {
      const matchesSearch =
        e.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.extractionSnippet && e.extractionSnippet.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || e.evidenceType === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || e.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [candidateEvidence, searchTerm, selectedCategory, selectedStatus]);

  if (candidateEvidence.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Evidence Center</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Organized technical artifacts backing candidate proof
          </p>
        </div>
        <EmptyState title="NO EVIDENCE UPLOADED YET" description="Upload project code, documentation, certificates, or screenshots in the Upload Center." />
      </div>
    );
  }

  return (
    <div id="evidence-center-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">Evidence Center</h1>
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {candidateEvidence.length} Artifacts
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Automated organization of source code, documents, screenshots, and challenge submissions
          </p>
        </div>

        <button
          onClick={() => navigateTo('upload-center')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <UploadCloud className="w-4 h-4 text-emerald-400" />
          Add More Evidence
        </button>
      </div>

      {/* Category Pills & Search */}
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-search-evidence"
              type="text"
              placeholder="Search filename or snippet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden"
            />
          </div>

          <select
            id="select-evidence-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUPPORTED">Supported</option>
            <option value="PARTIALLY SUPPORTED">Partially Supported</option>
            <option value="CONFLICTING">Conflicting</option>
            <option value="INSUFFICIENT">Insufficient</option>
            <option value="REQUIRES HUMAN REVIEW">Requires Review</option>
          </select>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvidence.map((ev) => {
          const matchedSkills = skills.filter((s) => ev.relatedSkillIds.includes(s.id));
          const matchedProjects = projects.filter((p) => ev.relatedProjectIds.includes(p.id));

          return (
            <div
              key={ev.id}
              id={`evidence-card-${ev.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      {ev.evidenceType === 'Source Code' ? (
                        <FileCode className="w-4 h-4" />
                      ) : ev.evidenceType === 'Screenshot' ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950 line-clamp-1">{ev.filename}</h4>
                      <p className="text-[11px] font-mono text-slate-500">
                        {ev.evidenceType} • {(ev.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={ev.status} size="sm" />
                </div>

                {/* Snippet / Content Preview */}
                {ev.extractionSnippet && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 my-2.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                      Extraction Snippet
                    </span>
                    <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed font-mono">
                      {ev.extractionSnippet}
                    </p>
                  </div>
                )}

                {/* Conflicts if any */}
                {ev.conflicts && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 my-2 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-900 block">Conflict Detected</span>
                      <span className="text-rose-800 text-[11px]">{ev.conflicts}</span>
                    </div>
                  </div>
                )}

                {/* Related Skills & Projects */}
                <div className="space-y-1.5 my-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                      Skills:
                    </span>
                    {matchedSkills.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">Unlinked</span>
                    ) : (
                      matchedSkills.map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {s.name}
                        </span>
                      ))
                    )}
                  </div>

                  {matchedProjects.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                        Project:
                      </span>
                      {matchedProjects.map((p) => (
                        <span
                          key={p.id}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-800"
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  Source: {ev.source}
                </span>

                <button
                  onClick={() => setPreviewEvidence(ev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect & Review</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
