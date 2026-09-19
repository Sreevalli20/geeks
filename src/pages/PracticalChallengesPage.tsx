import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  Clock,
  Play,
  Award,
  Code2,
  ShieldAlert,
  Zap,
  ArrowRight,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PracticalChallenge } from '../types';

export const PracticalChallengesPage: React.FC = () => {
  const {
    challenges,
    activeCandidate,
    skills,
    submissions,
    submitChallengeSolution,
  } = useApp();

  const [activeChallenge, setActiveChallenge] = useState<PracticalChallenge | null>(challenges[0] || null);
  const [solutionCode, setSolutionCode] = useState(challenges[0]?.starterCode || '');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const candidateSkills = activeCandidate
    ? skills.filter((s) => s.candidateId === activeCandidate.id)
    : skills;

  const candidateSubmissions = activeCandidate
    ? submissions.filter((s) => s.candidateId === activeCandidate.id)
    : submissions;

  const handleSelectChallenge = (chal: PracticalChallenge) => {
    setActiveChallenge(chal);
    setSolutionCode(chal.starterCode || '');
    setEvaluationResult(null);
  };

  const handleRunEvaluation = async () => {
    if (!activeChallenge) return;
    setIsEvaluating(true);

    try {
      // Real browser code evaluation and scoring
      const result = await submitChallengeSolution(activeChallenge.id, 'code', solutionCode);
      setEvaluationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div id="practical-challenges-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Practical Challenge Engine
            </h1>
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Role-Specific Validation
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Turn unverified resume claims into proof through real code evaluations
          </p>
        </div>

        {activeCandidate && (
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
            <span className="text-slate-500">Evaluating:</span>
            <span className="font-bold text-slate-900">{activeCandidate.name}</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Challenge Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Challenge Selector List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Available Practical Challenges ({challenges.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Auto-Recommended</span>
          </div>

          <div className="space-y-2">
            {challenges.map((chal) => {
              const isSelected = activeChallenge?.id === chal.id;
              const completedSubmission = candidateSubmissions.find((s) => s.challengeId === chal.id);

              return (
                <div
                  key={chal.id}
                  id={`challenge-item-${chal.id}`}
                  onClick={() => handleSelectChallenge(chal)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-slate-900 bg-white shadow-xs ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-950">{chal.title}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-700">
                      {chal.difficulty}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                    {chal.description || chal.promptText}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="font-mono text-indigo-700 font-semibold flex items-center gap-1">
                      <Code2 className="w-3 h-3" />
                      Tests: {chal.skillTested}
                    </span>

                    {completedSubmission ? (
                      <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Passed ({completedSubmission.totalScore ?? completedSubmission.scorePercentage}/100)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">30-45 mins</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Interactive Challenge Runner */}
        {activeChallenge && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-950">{activeChallenge.title}</h2>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                    {activeChallenge.category || activeChallenge.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Validated Skill: <strong>{activeChallenge.skillTested}</strong> • Benchmark Target: 80%+
                </p>
              </div>

              <button
                id="btn-run-challenge-eval"
                onClick={handleRunEvaluation}
                disabled={isEvaluating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                <span>{isEvaluating ? 'Evaluating Code...' : 'Submit & Evaluate Solution'}</span>
              </button>
            </div>

            {/* Problem Statement */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Challenge Specification
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">{activeChallenge.description || activeChallenge.promptText}</p>
            </div>

            {/* Interactive Code Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-slate-600" />
                  solution.{activeChallenge.skillTested.toLowerCase() === 'python' ? 'py' : 'ts'}
                </span>
                <span>Editable Candidate Submission</span>
              </div>

              <textarea
                id="challenge-solution-code-editor"
                value={solutionCode}
                onChange={(e) => setSolutionCode(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-700 leading-relaxed border border-slate-800 shadow-inner"
                spellCheck={false}
              />
            </div>

            {/* Evaluation Results Card */}
            {evaluationResult && (
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Solution Evaluated: {evaluationResult.verdict}
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Total Score: <strong>{evaluationResult.totalScore}/100</strong> • Proof updated across candidate profile!
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                    VERIFIED PROOF
                  </span>
                </div>

                {/* Score Rubric Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs pt-2 border-t border-emerald-200/80">
                  <div className="p-2 bg-white rounded-md border border-emerald-200">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Correctness</span>
                    <span className="font-bold text-slate-900">{evaluationResult.scoreBreakdown.correctness}/100</span>
                  </div>
                  <div className="p-2 bg-white rounded-md border border-emerald-200">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Code Quality</span>
                    <span className="font-bold text-slate-900">{evaluationResult.scoreBreakdown.codeQuality}/100</span>
                  </div>
                  <div className="p-2 bg-white rounded-md border border-emerald-200">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Performance</span>
                    <span className="font-bold text-slate-900">{evaluationResult.scoreBreakdown.performance}/100</span>
                  </div>
                  <div className="p-2 bg-white rounded-md border border-emerald-200">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Security</span>
                    <span className="font-bold text-slate-900">{evaluationResult.scoreBreakdown.security}/100</span>
                  </div>
                  <div className="p-2 bg-white rounded-md border border-emerald-200">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Architecture</span>
                    <span className="font-bold text-slate-900">{evaluationResult.scoreBreakdown.architecture}/100</span>
                  </div>
                </div>

                {/* Feedback Explainability */}
                <div className="p-3 bg-white rounded-lg border border-emerald-200 text-xs text-emerald-950 font-mono">
                  <span className="font-bold block mb-1">Explainable Benchmark Analysis:</span>
                  {evaluationResult.feedback}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
