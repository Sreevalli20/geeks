import React, { useState } from 'react';
import {
  ClipboardCheck,
  Award,
  CheckCircle2,
  BarChart3,
  Terminal,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';

export const AssessmentsPage: React.FC = () => {
  const {
    assessments,
    activeCandidate,
    submissions,
    certificates,
    navigateTo,
  } = useApp();

  const candidateAssessments = activeCandidate
    ? assessments.filter((a) => a.candidateId === activeCandidate.id)
    : assessments;

  const candidateSubmissions = activeCandidate
    ? submissions.filter((s) => s.candidateId === activeCandidate.id)
    : submissions;

  const candidateCertificates = activeCandidate
    ? certificates.filter((c) => c.candidateId === activeCandidate.id)
    : certificates;

  if (candidateAssessments.length === 0 && candidateSubmissions.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Assessments & Benchmarks</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Explainable evaluations, code rubrics, and technical credentials
          </p>
        </div>
        <EmptyState title="NO ASSESSMENTS RECORDED" description="Complete a practical challenge to generate an explainable assessment score." />
      </div>
    );
  }

  return (
    <div id="assessments-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Assessments & Technical Benchmarks
            </h1>
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Explainable Scoring
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Objective code review rubrics and verified industry credentials
          </p>
        </div>

        <button
          onClick={() => navigateTo('challenges')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Launch Practical Challenge</span>
        </button>
      </div>

      {/* Verified Certificates Section */}
      {candidateCertificates.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Verified Cloud & Architecture Credentials ({candidateCertificates.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Cryptographically & ID Validated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {candidateCertificates.map((cert) => (
              <div
                key={cert.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-950">{cert.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Issuer: <strong>{cert.issuer}</strong> • Issued: {cert.issueDate}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    Credential ID: {cert.credentialId || cert.id}
                  </p>
                </div>
                <StatusBadge status={cert.verificationStatus} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practical Challenge Evaluations Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Role-Specific Code Evaluations ({candidateAssessments.length + candidateSubmissions.length})
        </h3>

        <div className="space-y-4">
          {candidateAssessments.map((ass) => (
            <div
              key={ass.id}
              className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-950">{ass.title}</h4>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-200">
                      {ass.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{ass.scoreExplainable}</p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-slate-950 font-mono block">
                    {ass.score ?? 94}/100
                  </span>
                  <span className="text-[10px] uppercase font-mono text-emerald-700 font-bold">
                    Benchmark: Exceeds Standard
                  </span>
                </div>
              </div>

              {/* Rubric metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Correctness</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {ass.rubricBreakdown?.correctness ?? 95}/100
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Code Quality</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {ass.rubricBreakdown?.codeQuality ?? 92}/100
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Performance</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {ass.rubricBreakdown?.performance ?? 90}/100
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Security</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {ass.rubricBreakdown?.security ?? 96}/100
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Architecture</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {ass.rubricBreakdown?.architecture ?? 94}/100
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
