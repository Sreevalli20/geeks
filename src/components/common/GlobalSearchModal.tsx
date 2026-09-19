import React, { useState, useMemo } from 'react';
import { Search, X, User, Award, FolderKanban, ShieldAlert, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    candidates,
    skills,
    projects,
    claims,
    evidence,
    assessments,
    certificates,
    setActiveCandidateId,
    navigateTo,
    setPreviewEvidence,
  } = useApp();

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const matches: {
      id: string;
      type: 'Candidate' | 'Skill' | 'Project' | 'Claim' | 'Evidence' | 'Assessment' | 'Certificate';
      title: string;
      subtitle: string;
      meta?: string;
      onSelect: () => void;
    }[] = [];

    // Candidates
    candidates.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.detectedRole.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
        matches.push({
          id: `cand-${c.id}`,
          type: 'Candidate',
          title: c.name,
          subtitle: `${c.detectedRole} • ${c.email || 'No email'}`,
          meta: c.isDevelopmentData ? 'DEV DATA' : undefined,
          onSelect: () => {
            setActiveCandidateId(c.id);
            navigateTo('candidates');
            setIsSearchOpen(false);
          },
        });
      }
    });

    // Skills
    skills.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) {
        matches.push({
          id: `sk-${s.id}`,
          type: 'Skill',
          title: s.name,
          subtitle: `Category: ${s.category} • State: ${s.verificationState} (${s.evidenceCount} evidence)`,
          onSelect: () => {
            setActiveCandidateId(s.candidateId);
            navigateTo('skills');
            setIsSearchOpen(false);
          },
        });
      }
    });

    // Projects
    projects.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        matches.push({
          id: `proj-${p.id}`,
          type: 'Project',
          title: p.name,
          subtitle: p.description.substring(0, 80) + '...',
          onSelect: () => {
            setActiveCandidateId(p.candidateId);
            navigateTo('overview');
            setIsSearchOpen(false);
          },
        });
      }
    });

    // Claims
    claims.forEach((cl) => {
      if (cl.title.toLowerCase().includes(q) || cl.description.toLowerCase().includes(q)) {
        matches.push({
          id: `cl-${cl.id}`,
          type: 'Claim',
          title: cl.title,
          subtitle: `${cl.claimType} • Status: ${cl.evidenceStatus}`,
          onSelect: () => {
            setActiveCandidateId(cl.candidateId);
            navigateTo('claims');
            setIsSearchOpen(false);
          },
        });
      }
    });

    // Evidence
    evidence.forEach((e) => {
      if (e.filename.toLowerCase().includes(q) || (e.extractionSnippet && e.extractionSnippet.toLowerCase().includes(q))) {
        matches.push({
          id: `ev-${e.id}`,
          type: 'Evidence',
          title: e.filename,
          subtitle: `${e.evidenceType} • ${(e.fileSize / 1024).toFixed(1)} KB • Status: ${e.status}`,
          onSelect: () => {
            setActiveCandidateId(e.candidateId);
            setPreviewEvidence(e);
            setIsSearchOpen(false);
          },
        });
      }
    });

    // Assessments
    assessments.forEach((a) => {
      if (a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)) {
        matches.push({
          id: `ass-${a.id}`,
          type: 'Assessment',
          title: a.title,
          subtitle: `${a.category} • ${a.scoreExplainable}`,
          onSelect: () => {
            setActiveCandidateId(a.candidateId);
            navigateTo('assessments');
            setIsSearchOpen(false);
          },
        });
      }
    });

    // Certificates
    certificates.forEach((cert) => {
      if (cert.title.toLowerCase().includes(q) || cert.issuer.toLowerCase().includes(q)) {
        matches.push({
          id: `cert-${cert.id}`,
          type: 'Certificate',
          title: cert.title,
          subtitle: `Issuer: ${cert.issuer} • Status: ${cert.verificationStatus}`,
          onSelect: () => {
            setActiveCandidateId(cert.candidateId);
            navigateTo('claims');
            setIsSearchOpen(false);
          },
        });
      }
    });

    return matches.slice(0, 15);
  }, [query, candidates, skills, projects, claims, evidence, assessments, certificates, setActiveCandidateId, navigateTo, setPreviewEvidence, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div
      id="global-search-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        id="global-search-modal"
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search candidates, skills, claims, evidence, projects, assessments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded-sm bg-slate-100"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Type to search across all application claims, skills, code artifacts, and candidates.
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onSelect}
                  className="w-full text-left flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-semibold">
                      {item.type === 'Candidate' && <User className="w-4 h-4" />}
                      {item.type === 'Skill' && <Award className="w-4 h-4" />}
                      {item.type === 'Project' && <FolderKanban className="w-4 h-4" />}
                      {item.type === 'Claim' && <ShieldAlert className="w-4 h-4" />}
                      {item.type === 'Evidence' && <FileText className="w-4 h-4" />}
                      {item.type === 'Assessment' && <CheckCircle2 className="w-4 h-4" />}
                      {item.type === 'Certificate' && <Award className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-600">
                          {item.type}
                        </span>
                        {item.meta && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-xs bg-amber-100 text-amber-800">
                            {item.meta}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Search current browser state</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
