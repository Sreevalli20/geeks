import React, { useState } from 'react';
import { X, Download, ShieldCheck, AlertTriangle, FileCode, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from './StatusBadge';
import { VerificationStatus } from '../../types';

export const FilePreviewModal: React.FC = () => {
  const { previewEvidence, setPreviewEvidence, updateEvidenceStatus, skills } = useApp();
  const [reviewNote, setReviewNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus>('SUPPORTED');

  if (!previewEvidence) return null;

  const isImage =
    previewEvidence.fileType.startsWith('image/') ||
    previewEvidence.filename.endsWith('.png') ||
    previewEvidence.filename.endsWith('.jpg') ||
    previewEvidence.filename.endsWith('.jpeg');

  const relatedSkillsList = skills.filter((s) => previewEvidence.relatedSkillIds.includes(s.id));

  const handleApplyReview = () => {
    updateEvidenceStatus(previewEvidence.id, selectedStatus, reviewNote || undefined);
    setPreviewEvidence(null);
  };

  return (
    <div
      id="file-preview-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={() => setPreviewEvidence(null)}
    >
      <div
        id="file-preview-modal"
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{previewEvidence.filename}</h3>
              <p className="text-xs text-slate-500">
                {previewEvidence.evidenceType} • {(previewEvidence.fileSize / 1024).toFixed(1)} KB • Source: {previewEvidence.source}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={previewEvidence.status} size="sm" />
            <button
              id="btn-close-file-preview"
              onClick={() => setPreviewEvidence(null)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isImage && previewEvidence.fileDataUrl ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-900/5 flex items-center justify-center p-4">
              <img
                src={previewEvidence.fileDataUrl}
                alt={previewEvidence.filename}
                className="max-h-96 object-contain rounded-md shadow-xs"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : previewEvidence.rawContent ? (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 font-mono">
                <span>RAW CONTENT / CODE PREVIEW</span>
                <span>{previewEvidence.rawContent.length} chars</span>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto max-h-80 leading-relaxed border border-slate-800">
                {previewEvidence.rawContent}
              </pre>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <p className="text-sm text-slate-700 font-medium">{previewEvidence.extractionSnippet}</p>
              <p className="text-xs text-slate-500 mt-2">
                Binary or non-plain-text payload parsed by browser upload handler.
              </p>
            </div>
          )}

          {/* Extracted snippet */}
          {previewEvidence.extractionSnippet && (
            <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-100">
              <h4 className="text-xs font-semibold text-blue-950 uppercase tracking-wide mb-1">
                Extracted Information & Heuristics
              </h4>
              <p className="text-xs text-blue-900 leading-relaxed">{previewEvidence.extractionSnippet}</p>
            </div>
          )}

          {/* Conflicts notice if any */}
          {previewEvidence.conflicts && (
            <div className="p-3.5 bg-rose-50 rounded-lg border border-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-rose-900 uppercase">Identified Evidence Conflict</h4>
                <p className="text-xs text-rose-800 mt-0.5">{previewEvidence.conflicts}</p>
              </div>
            </div>
          )}

          {/* Connected Skills */}
          {relatedSkillsList.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Directly Associated Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {relatedSkillsList.map((sk) => (
                  <span
                    key={sk.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recruiter / Human Review Section */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mt-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Human Reviewer Verification Override
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Verification Status</label>
                <select
                  id="select-evidence-review-status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                >
                  <option value="SUPPORTED">SUPPORTED (Verified Proof)</option>
                  <option value="PARTIALLY SUPPORTED">PARTIALLY SUPPORTED</option>
                  <option value="INSUFFICIENT">INSUFFICIENT (Lacks Depth)</option>
                  <option value="CONFLICTING">CONFLICTING (Discrepancy Found)</option>
                  <option value="REQUIRES HUMAN REVIEW">REQUIRES HUMAN REVIEW</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Reviewer Audit Comment</label>
                <input
                  id="input-evidence-review-note"
                  type="text"
                  placeholder="e.g. Code matches git commit logs; high quality..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
            <button
              id="btn-apply-evidence-review"
              onClick={handleApplyReview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
            >
              Save Review Audit
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>ID: {previewEvidence.id}</span>
          <button
            onClick={() => setPreviewEvidence(null)}
            className="px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
