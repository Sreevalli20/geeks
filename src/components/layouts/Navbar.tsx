import React from 'react';
import {
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet,
  Search,
  ChevronDown,
  User,
  Menu,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    candidates,
    activeCandidate,
    setActiveCandidateId,
    navigateTo,
    setIsSearchOpen,
    isProcessingUpload,
  } = useApp();

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200"
    >
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Mobile toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            id="btn-sidebar-toggle-mobile"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            id="brand-header"
            onClick={() => navigateTo('overview')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-black shadow-xs group-hover:bg-slate-800 transition-colors">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-950">
                  SkillProof
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                  Evidence Engine
                </span>
              </div>
              <p className="hidden md:block text-[10px] font-semibold text-slate-500 tracking-tight">
                DON'T HIRE THE RESUME. HIRE THE PROOF.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search trigger & Active Candidate switcher */}
        <div className="flex items-center gap-3 flex-1 max-w-xl mx-4 justify-end md:justify-center">
          {/* Quick search input button */}
          <button
            id="btn-global-search-trigger"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center justify-between w-full max-w-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-500 transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search claims, skills, code...</span>
            </span>
            <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded-sm border border-slate-200 text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Active Candidate Selector */}
          {candidates.length > 0 && (
            <div className="relative flex items-center">
              <div className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  id="select-active-candidate"
                  value={activeCandidate?.id || ''}
                  onChange={(e) => setActiveCandidateId(e.target.value)}
                  aria-label="Active Candidate"
                  className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-hidden cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.isDevelopmentData ? '— [DEV DATA]' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Primary Call to Action & Secondary Import */}
        <div className="flex items-center gap-2">
          {/* Mobile search icon button */}
          <button
            id="btn-mobile-search"
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Import Records (Secondary) */}
          <button
            id="btn-nav-import"
            onClick={() => navigateTo('import-center')}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Records</span>
          </button>

          {/* Upload Resume (Primary CTA) */}
          <button
            id="btn-nav-upload-resume"
            onClick={() => navigateTo('upload-center')}
            disabled={isProcessingUpload}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Upload Resume</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </div>
    </header>
  );
};
