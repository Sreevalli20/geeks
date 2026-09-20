import React from 'react';
import { UploadCloud, FileText, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'NO CANDIDATE DATA YET',
  description = "Upload a resume to automatically build the candidate's explainable Proof Profile without manual data entry.",
}) => {
  const { navigateTo } = useApp();

  return (
    <div
      id="empty-state-container"
      className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-xl mx-auto rounded-xl border border-dashed border-slate-300 bg-white shadow-xs my-8"
    >
      <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 mb-4 shadow-2xs">
        <FileText className="w-7 h-7" />
      </div>

      <h3 id="empty-state-title" className="text-lg font-semibold text-slate-900 uppercase tracking-wide">
        {title}
      </h3>
      <p id="empty-state-description" className="text-sm text-slate-600 mt-2 mb-6 max-w-md leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          id="btn-empty-upload-resume"
          onClick={() => navigateTo('upload-center')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors shadow-xs"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Resume
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 w-full flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Zero Manual Typing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Auto Skill & Claim Parsing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Proof Verification
        </span>
      </div>
    </div>
  );
};
