import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UploadCloud,
  ShieldAlert,
  Award,
  FileCheck2,
  GitCompare,
  Terminal,
  Network,
  ClipboardCheck,
  History,
  FileSpreadsheet,
  FileText,
  Settings,
  X,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    currentView,
    navigateTo,
    candidates,
    claims,
    skills,
    evidence,
    challenges,
    activeCandidate,
  } = useApp();

  const candidateClaims = activeCandidate ? claims.filter((c) => c.candidateId === activeCandidate.id) : claims;
  const candidateSkills = activeCandidate ? skills.filter((s) => s.candidateId === activeCandidate.id) : skills;
  const candidateEvidence = activeCandidate ? evidence.filter((e) => e.candidateId === activeCandidate.id) : evidence;

  const conflictingClaimsCount = candidateClaims.filter((c) => c.evidenceStatus === 'Conflicting').length;
  const reviewRequiredCount = candidateClaims.filter((c) => c.evidenceStatus === 'Requires Human Review').length;

  const navItems: {
    id: AppView;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    section?: string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, section: 'CORE' },
    { id: 'candidates', label: 'Candidates', icon: Users, badge: candidates.length },
    { id: 'candidate-profile', label: 'Candidate Profile', icon: UserCheck },
    { id: 'upload-center', label: 'Upload Center', icon: UploadCloud },
    { id: 'claims', label: 'Claim Engine', icon: ShieldAlert, badge: candidateClaims.length, section: 'PROOF ENGINE' },
    { id: 'skills', label: 'Skills Inventory', icon: Award, badge: candidateSkills.length },
    { id: 'evidence', label: 'Evidence Center', icon: FileCheck2, badge: candidateEvidence.length },
    { id: 'claim-vs-proof', label: 'Claim vs Proof', icon: GitCompare, badge: 'KEY' },
    { id: 'challenges', label: 'Practical Challenges', icon: Terminal, badge: challenges.length, section: 'VALIDATION' },
    { id: 'evidence-graph', label: 'Evidence Graph', icon: Network },
    { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
    { id: 'verification', label: 'Verification & Audit', icon: History, badge: conflictingClaimsCount > 0 ? `${conflictingClaimsCount} Alert` : undefined, badgeColor: 'bg-rose-100 text-rose-700' },
    { id: 'reports', label: 'Reports', icon: FileText, section: 'PLATFORM' },
    { id: 'import-center', label: 'Import Center', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (id: AppView) => {
    navigateTo(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-0 lg:top-16 z-50 lg:z-30 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-slate-50 border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden bg-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">SkillProof Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Context Pill in Sidebar */}
        {activeCandidate && (
          <div className="px-3 pt-3 pb-1">
            <div
              id="sidebar-candidate-card"
              onClick={() => handleSelect('candidates')}
              className="p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  Active Candidate
                </span>
                {activeCandidate.isDevelopmentData ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 uppercase tracking-tight">
                    DEV DATA
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 uppercase tracking-tight">
                    UPLOADED
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{activeCandidate.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{activeCandidate.detectedRole}</p>
            </div>
          </div>
        )}

        {/* Nav list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {navItems.map((item, idx) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <div className="pt-3 pb-1 px-2.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                    {item.section}
                  </div>
                )}
                <button
                  id={`nav-item-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                        item.badgeColor ||
                        (isActive
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-200 text-slate-700')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Sidebar Footer: Trust Badge */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-500">
              Explainable Proof Engine
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
