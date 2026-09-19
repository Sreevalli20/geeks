import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Award,
  FileCheck2,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ClipboardCheck,
  FileText,
  Filter,
  Layers,
  ChevronRight,
  Code2,
  Eye,
  Calendar,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { ClaimType, Skill, EvidenceItem, PracticalChallenge } from '../types';

export const CandidateProfilePage: React.FC = () => {
  const {
    candidates,
    activeCandidate,
    setActiveCandidateId,
    claims,
    skills,
    projects,
    experiences,
    certificates,
    evidence,
    assessments,
    challenges,
    setPreviewEvidence,
    navigateTo,
  } = useApp();

  const [activeClaimFilter, setActiveClaimFilter] = useState<string>('ALL');
  const [skillComparisonFilter, setSkillComparisonFilter] = useState<'ALL' | 'PROVEN' | 'UNPROVEN' | 'CONFLICTING'>('ALL');

  if (!activeCandidate) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <EmptyState
          title="NO CANDIDATE SELECTED"
          description="Select or upload a candidate profile to inspect verified proof, claims, and evidence."
        />
      </div>
    );
  }

  // Filter items specifically for the active candidate
  const candidateClaims = claims.filter((c) => c.candidateId === activeCandidate.id);
  const candidateSkills = skills.filter((s) => s.candidateId === activeCandidate.id);
  const candidateProjects = projects.filter((p) => p.candidateId === activeCandidate.id);
  const candidateExperiences = experiences.filter((e) => e.candidateId === activeCandidate.id);
  const candidateCertificates = certificates.filter((c) => c.candidateId === activeCandidate.id);
  const candidateEvidence = evidence.filter((e) => e.candidateId === activeCandidate.id);
  const candidateAssessments = assessments.filter((a) => a.candidateId === activeCandidate.id);

  // Proven vs Unproven Skills
  const provenSkills = candidateSkills.filter(
    (s) => s.isProven || s.verificationState === 'Supported'
  );
  const unprovenSkills = candidateSkills.filter(
    (s) => !s.isProven && s.verificationState !== 'Supported'
  );
  const conflictingSkills = candidateSkills.filter(
    (s) => s.verificationState === 'Conflicting'
  );

  const filteredSkills = candidateSkills.filter((s) => {
    if (skillComparisonFilter === 'PROVEN') return s.isProven || s.verificationState === 'Supported';
    if (skillComparisonFilter === 'UNPROVEN') return !s.isProven && s.verificationState !== 'Supported';
    if (skillComparisonFilter === 'CONFLICTING') return s.verificationState === 'Conflicting';
    return true;
  });

  // Filtered Claims
  const filteredClaims = candidateClaims.filter((c) => {
    if (activeClaimFilter === 'ALL') return true;
    return c.claimType === activeClaimFilter;
  });

  // Recommended Practical Challenges: Recommend challenges that test candidate's unverified or key skills
  const recommendedChallenges = challenges.filter((chal) => {
    const testsCandidateSkill = candidateSkills.some(
      (s) => s.name.toLowerCase() === chal.skillTested.toLowerCase()
    );
    return testsCandidateSkill || chal.role.toLowerCase().includes(activeCandidate.detectedRole.toLowerCase());
  });

  // Overall status
  const hasConflicts = candidateClaims.some((c) => c.evidenceStatus === 'Conflicting') || conflictingSkills.length > 0;
  const overallStatus =
    provenSkills.length >= 4 && !hasConflicts
      ? 'SUPPORTED'
      : hasConflicts
      ? 'CONFLICTING'
      : provenSkills.length > 0
      ? 'PARTIALLY SUPPORTED'
      : 'INSUFFICIENT';

  return (
    <div id="candidate-profile-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('candidates')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Candidates
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-900">Profile Dossier</span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 ml-2">
            ID: {activeCandidate.id}
          </span>
        </div>

        {/* Candidate Switcher Dropdown */}
        {candidates.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Switch Profile:</span>
            <select
              value={activeCandidate.id}
              onChange={(e) => setActiveCandidateId(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-hidden focus:border-slate-500 shadow-2xs"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.detectedRole})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Candidate Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Main Info */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {activeCandidate.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    {activeCandidate.name}
                  </h1>
                  {activeCandidate.isDevelopmentData && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300 uppercase">
                      Dev Portfolio
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-slate-700">
                    {activeCandidate.detectedRole}
                  </span>
                  {activeCandidate.targetRole && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-mono">
                        Target: {activeCandidate.targetRole}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl pt-1">
              {activeCandidate.summary}
            </p>

            {/* Contact Information & Links Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
              {activeCandidate.email && (
                <a
                  href={`mailto:${activeCandidate.email}`}
                  className="flex items-center gap-1.5 hover:text-slate-950 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeCandidate.email}</span>
                </a>
              )}
              {activeCandidate.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeCandidate.phone}</span>
                </span>
              )}
              {activeCandidate.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeCandidate.location}</span>
                </span>
              )}

              {/* Social / Portfolio Links */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                {activeCandidate.links?.github && (
                  <a
                    href={activeCandidate.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 bg-slate-100 px-2 py-1 rounded-md text-[11px] font-mono font-medium transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    <span>GitHub</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </a>
                )}
                {activeCandidate.links?.linkedin && (
                  <a
                    href={activeCandidate.links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 bg-slate-100 px-2 py-1 rounded-md text-[11px] font-mono font-medium transition-colors"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </a>
                )}
                {activeCandidate.links?.portfolio && (
                  <a
                    href={activeCandidate.links.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 bg-slate-100 px-2 py-1 rounded-md text-[11px] font-mono font-medium transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Portfolio</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats & Action Hub */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Proof Status
                </span>
                <StatusBadge status={overallStatus} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-slate-200">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">
                    Proven Skills
                  </span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {provenSkills.length}/{candidateSkills.length}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">
                    Evidence Files
                  </span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {candidateEvidence.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigateTo('evidence-graph')}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Open Evidence Graph</span>
              </button>
              <button
                onClick={() => navigateTo('claim-vs-proof')}
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Claim vs Proof Matrix</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Claimed Skills vs. Proven Skills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-950">Claimed Skills vs. Proven Skills</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {candidateSkills.length} Total Evaluated
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Comparison between self-reported resume statements and verifiable code / challenge artifacts
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'PROVEN', 'UNPROVEN', 'CONFLICTING'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSkillComparisonFilter(filter)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  skillComparisonFilter === filter
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === 'ALL' && `All (${candidateSkills.length})`}
                {filter === 'PROVEN' && `Proven (${provenSkills.length})`}
                {filter === 'UNPROVEN' && `Unproven (${unprovenSkills.length})`}
                {filter === 'CONFLICTING' && `Conflicting (${conflictingSkills.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Comparison Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-mono uppercase text-[10px] text-slate-500 tracking-wider">
                  <th className="p-3.5 font-bold">Skill & Category</th>
                  <th className="p-3.5 font-bold">Resume Claim Level</th>
                  <th className="p-3.5 font-bold">Verification State</th>
                  <th className="p-3.5 font-bold">Evidence Strength</th>
                  <th className="p-3.5 font-bold">Supporting Evidence</th>
                  <th className="p-3.5 font-bold">Audit Rationale & Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSkills.map((sk) => {
                  const linkedEv = candidateEvidence.filter((e) =>
                    sk.relatedEvidenceIds.includes(e.id) || e.relatedSkillIds.includes(sk.id)
                  );

                  return (
                    <tr key={sk.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          {sk.isProven || sk.verificationState === 'Supported' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : sk.verificationState === 'Conflicting' ? (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{sk.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              {sk.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {sk.resumeClaimLevel}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <StatusBadge status={sk.verificationState} size="sm" />
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            sk.evidenceStrength === 'High' || sk.evidenceStrength === 'Production Grade'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : sk.evidenceStrength === 'Moderate'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : sk.evidenceStrength === 'Weak'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {sk.evidenceStrength}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {linkedEv.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {linkedEv.map((ev) => (
                              <button
                                key={ev.id}
                                onClick={() => setPreviewEvidence(ev)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-mono transition-colors"
                                title={ev.filename}
                              >
                                <FileCheck2 className="w-3 h-3 text-emerald-600" />
                                <span className="max-w-[120px] truncate">{ev.filename}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No files linked</span>
                        )}
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {sk.missingProofReason || 'Corroborated by code repository evidence.'}
                        </p>
                        {sk.recommendedValidation && (
                          <span className="text-[10px] font-mono text-indigo-700 font-semibold block mt-1">
                            Recommendation: {sk.recommendedValidation}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Work Experience & Education (2-Column Responsive Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Experience (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-950">Work Experience</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Source: Extracted from Resume
            </span>
          </div>

          <div className="space-y-4">
            {candidateExperiences.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                No work experience recorded for this candidate.
              </div>
            ) : (
              candidateExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exp.company}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exp.period}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                        Claimed in Role:
                      </span>
                      {exp.claimedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-mono text-emerald-600 font-bold">
                        Verified via Evidence:
                      </span>
                      {exp.verifiedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Education & Credentials (1 Col) */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-950">Education</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">Verified</span>
          </div>

          {/* Education Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            {activeCandidate.education ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {activeCandidate.education.degree}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {activeCandidate.education.institution}
                    </p>
                  </div>
                  <StatusBadge status="SUPPORTED" size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500 font-mono">
                  <span>Graduation Year:</span>
                  <span className="font-bold text-slate-800">
                    {activeCandidate.education.graduationYear}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Source: Extracted from Resume Section "Education"
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500 italic">No formal education record found.</p>
            )}
          </div>

          {/* Certifications Card */}
          <div className="border-b border-slate-200 pb-2 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-950">Certifications & Badges</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {candidateCertificates.length} Listed
            </span>
          </div>

          <div className="space-y-3">
            {candidateCertificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{cert.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Issuer: <strong>{cert.issuer}</strong>
                    </p>
                  </div>
                  <StatusBadge status={cert.verificationStatus} size="sm" />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                  <span>Issued: {cert.issueDate || 'Recent'}</span>
                  <span>ID: {cert.credentialId || cert.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: Detected Resume Claims */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-950">Detected Claims</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {candidateClaims.length} Extracted
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Specific capability statements extracted from candidate documents, cross-examined against audit artifacts
            </p>
          </div>

          {/* Claim type filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'Technical Skill', 'Project Achievement', 'Work Experience', 'Certification'] as const).map(
              (ct) => (
                <button
                  key={ct}
                  onClick={() => setActiveClaimFilter(ct)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activeClaimFilter === ct
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {ct === 'ALL' ? 'All' : ct}
                </button>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClaims.map((cl) => {
            const isConflicting = cl.evidenceStatus === 'Conflicting';
            return (
              <div
                key={cl.id}
                className={`p-5 rounded-xl border bg-white shadow-2xs flex flex-col justify-between transition-all ${
                  isConflicting ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {cl.claimType}
                    </span>
                    <StatusBadge status={cl.evidenceStatus} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{cl.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{cl.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                    <span>Source: {cl.source}</span>
                    <span>Level: {cl.declaredLevel || 'Declared'}</span>
                  </div>

                  {cl.reviewerNotes && (
                    <div className="p-2 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[11px]">
                      <span className="font-bold block text-[10px] uppercase font-mono text-slate-500">
                        Audit Note:
                      </span>
                      {cl.reviewerNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 font-mono text-[10px]">
                      {cl.evidenceIds.length} Linked Evidence
                    </span>
                    <button
                      onClick={() => navigateTo('claim-vs-proof')}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1"
                    >
                      <span>Inspect Proof</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Evidence Items */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-950">Evidence Items</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {candidateEvidence.length} Files & Artifacts
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Code repositories, architecture RFCs, practical submissions, and credential proofs
            </p>
          </div>

          <button
            onClick={() => navigateTo('evidence')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1"
          >
            <span>View in Evidence Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidateEvidence.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]" title={ev.filename}>
                      {ev.filename}
                    </span>
                  </div>
                  <StatusBadge status={ev.status} size="sm" />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="px-1.5 py-0.5 bg-slate-100 rounded-sm text-slate-700">
                    {ev.evidenceType}
                  </span>
                  <span>{ev.source}</span>
                </div>

                {ev.extractionSnippet && (
                  <p className="text-[11px] text-slate-600 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 line-clamp-3">
                    {ev.extractionSnippet}
                  </p>
                )}

                {ev.conflicts && (
                  <div className="p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                    <span className="font-bold block text-[10px] uppercase font-mono">Discrepancy:</span>
                    {ev.conflicts}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Confidence:</span>
                  <span className="text-xs font-bold font-mono text-slate-800">
                    {ev.confidenceScore || 90}%
                  </span>
                </div>

                <button
                  onClick={() => setPreviewEvidence(ev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect Artifact</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: Assessment Results */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-950">Assessment Results</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {candidateAssessments.length} Completed
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Standardized rubric evaluation benchmarks with multidimensional scoring
            </p>
          </div>

          <button
            onClick={() => navigateTo('assessments')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1"
          >
            <span>All Benchmarks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {candidateAssessments.map((ass) => (
            <div
              key={ass.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-950">{ass.title}</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                      {ass.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Evaluated: {ass.date} • Reference ID: {ass.id}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-slate-950 font-mono block">
                    {ass.score ?? 94}/100
                  </span>
                  <span className="text-[10px] uppercase font-mono text-emerald-700 font-bold">
                    Benchmark: Exceeds Standard
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {ass.scoreExplainable}
              </p>

              {/* Rubric Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">
                    Correctness
                  </span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {ass.rubricBreakdown?.correctness ?? 95}/100
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">
                    Code Quality
                  </span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {ass.rubricBreakdown?.codeQuality ?? 92}/100
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">
                    Performance
                  </span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {ass.rubricBreakdown?.performance ?? 90}/100
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">
                    Security
                  </span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {ass.rubricBreakdown?.security ?? 96}/100
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">
                    Architecture
                  </span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {ass.rubricBreakdown?.architecture ?? 94}/100
                  </span>
                </div>
              </div>

              {/* Verified Skills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                  Verified Skills:
                </span>
                {ass.verifiedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: Recommended Practical Challenges */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-600" />
              <h2 className="text-lg font-bold text-slate-950">
                Recommended Practical Challenges
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                {recommendedChallenges.length} Targeted
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Hands-on coding challenges recommended to address unproven claims or validate core competencies
            </p>
          </div>

          <button
            onClick={() => navigateTo('challenges')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1"
          >
            <span>Open Sandbox</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedChallenges.map((chal) => (
            <div
              key={chal.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {chal.role}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold border ${
                      chal.difficulty === 'Staff' || chal.difficulty === 'Senior'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}
                  >
                    {chal.difficulty}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{chal.title}</h3>

                {/* Why Recommended Callout */}
                <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-indigo-700">
                    <Sparkles className="w-3 h-3" />
                    <span>Why Recommended for Candidate</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans">{chal.whyRecommended}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                    Tests:
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                    {chal.skillTested}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => navigateTo('challenges')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Launch Coding Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
