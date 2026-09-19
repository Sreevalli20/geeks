import { Candidate, Claim, Skill, Project, EvidenceItem, PracticalChallenge, ChallengeSubmission, Assessment, Report } from '../types';

export interface ExplainableReportData {
  candidateId: string;
  candidateName: string;
  detectedRole: string;
  generatedAt: string;
  proofScore: number;
  executiveRecommendation: string;
  provenSkills: string[];
  unprovenClaims: string[];
  evidenceBreakdown: {
    totalCount: number;
    sourceCodeCount: number;
    documentationCount: number;
    certificateCount: number;
    challengeCount: number;
  };
}

export function generateExplainableReport(
  candidate: Candidate,
  claims: Claim[],
  skills: Skill[],
  evidence: EvidenceItem[],
  assessments: Assessment[]
): ExplainableReportData {
  const provenSkills = skills
    .filter((s) => s.isProven || s.verificationState === 'Supported')
    .map((s) => s.name);

  const unprovenClaims = claims
    .filter((c) => c.evidenceStatus !== 'Supported')
    .map((c) => c.title);

  const sourceCodeCount = evidence.filter((e) => e.evidenceType === 'Source Code').length;
  const documentationCount = evidence.filter((e) => e.evidenceType === 'Documentation').length;
  const certificateCount = evidence.filter((e) => e.evidenceType === 'Certificate').length;
  const challengeCount = evidence.filter((e) => e.evidenceType === 'Practical Challenge').length;

  const totalSkills = Math.max(skills.length, 1);
  const proofScore = Math.min(
    100,
    Math.round((provenSkills.length / totalSkills) * 60 + Math.min(evidence.length * 8, 40))
  );

  let executiveRecommendation = '';
  if (proofScore >= 80) {
    executiveRecommendation = `STRONG PROCEED TO OFFER/FINAL INTERVIEW: Candidate ${candidate.name} exhibits exceptional verifiable code artifacts and validated distributed systems implementations that exceed baseline requirements.`;
  } else if (proofScore >= 50) {
    executiveRecommendation = `PROCEED WITH TARGETED TECHNICAL PROBE: Candidate exhibits solid baseline code, but unverified claims require an architecture review on unbacked skills.`;
  } else {
    executiveRecommendation = `ASSIGN PRACTICAL CHALLENGES: Insufficient code repository proof. Candidate has not yet demonstrated hands-on technical claims through submitted artifacts.`;
  }

  return {
    candidateId: candidate.id,
    candidateName: candidate.name,
    detectedRole: candidate.detectedRole,
    generatedAt: new Date().toISOString(),
    proofScore,
    executiveRecommendation,
    provenSkills,
    unprovenClaims,
    evidenceBreakdown: {
      totalCount: evidence.length,
      sourceCodeCount,
      documentationCount,
      certificateCount,
      challengeCount,
    },
  };
}

export const reportsService = {
  generateReport: (
    type: Report['type'],
    candidate: Candidate,
    claims: Claim[],
    skills: Skill[],
    projects: Project[],
    evidence: EvidenceItem[],
    challenges: PracticalChallenge[],
    submissions: ChallengeSubmission[],
    assessments: Assessment[]
  ): Report => {
    const candidateClaims = claims.filter((c) => c.candidateId === candidate.id);
    const candidateSkills = skills.filter((s) => s.candidateId === candidate.id);
    const candidateEvidence = evidence.filter((e) => e.candidateId === candidate.id);
    const candidateSubmissions = submissions.filter((s) => s.candidateId === candidate.id);
    const candidateAssessments = assessments.filter((a) => a.candidateId === candidate.id);

    const provenSkills = candidateSkills.filter((s) => s.isProven || s.verificationState === 'Supported').map((s) => s.name);
    const claimedSkills = candidateClaims.filter((c) => c.claimType === 'Technical Skill').map((c) => c.title);
    const supportedCount = candidateClaims.filter((c) => c.evidenceStatus === 'Supported').length;
    const conflictingClaims = candidateClaims.filter((c) => c.evidenceStatus === 'Conflicting');
    const gaps = candidateSkills.filter((s) => s.verificationState === 'Insufficient Evidence');

    let summary = '';
    const sections: Report['sections'] = [];

    if (type === 'Candidate Proof Report') {
      summary = `Comprehensive explainable proof evaluation for ${candidate.name}. Analyzed ${candidateClaims.length} explicit claims across ${candidateEvidence.length} uploaded evidence artifacts.`;
      sections.push({
        title: 'Executive Summary & Trust Classification',
        content: `Target Role: ${candidate.targetRole || candidate.detectedRole}. Proven Skills Count: ${provenSkills.length} of ${claimedSkills.length} claimed. Evidence Base: ${candidateEvidence.length} files.`,
        items: [
          `Candidate: ${candidate.name} (${candidate.email || 'Email unlisted'})`,
          `Education: ${candidate.education ? `${candidate.education.degree}, ${candidate.education.institution} (${candidate.education.graduationYear})` : 'Education not verified'}`,
          `Key Verified Strengths: ${provenSkills.join(', ') || 'Pending validation'}`,
        ],
      });
      sections.push({
        title: 'Claimed vs Proven Skills Comparison',
        content: 'Direct cross-examination of resume claims against uploaded technical work artifacts.',
        items: candidateSkills.map(
          (s) => `${s.name}: Resume claimed "${s.resumeClaimLevel}" → State: [${s.verificationState}] (Strength: ${s.evidenceStrength}). ${s.missingProofReason || ''}`
        ),
      });
      sections.push({
        title: 'Identified Skill Gaps & Conflicting Information',
        content: `Found ${gaps.length} skill claims with insufficient proof and ${conflictingClaims.length} conflicting claims.`,
        items: [
          ...gaps.map((g) => `Gap: ${g.name} — ${g.missingProofReason}`),
          ...conflictingClaims.map((c) => `Conflict: ${c.title} — ${c.description} (Evidence ID: ${c.evidenceIds.join(', ')})`),
        ],
      });
    } else if (type === 'Skill Evidence Report') {
      summary = `Detailed evidence mapping for individual technical skills claimed by ${candidate.name}.`;
      sections.push({
        title: 'Evidence Coverage Matrix',
        content: `Evaluated ${candidateSkills.length} skills against source code, documentation, and assessments.`,
        items: candidateSkills.map((s) => {
          const matched = candidateEvidence.filter((e) => s.relatedEvidenceIds.includes(e.id));
          return `${s.name} (${s.category}): ${s.verificationState} | Supporting files: ${matched.map((m) => m.filename).join(', ') || 'None'}`;
        }),
      });
    } else if (type === 'Claim vs Proof Report') {
      summary = `Granular claim-by-claim verification table contrasting candidate statements with concrete evidence.`;
      sections.push({
        title: 'Claim Decomposition',
        content: 'Breakdown of resume assertions into explicit claim units with traceable proof states.',
        items: candidateClaims.map(
          (c) => `[${c.claimType}] "${c.title}": Status = ${c.evidenceStatus}. Source = ${c.source}. ${c.reviewerNotes ? `Reviewer Notes: ${c.reviewerNotes}` : ''}`
        ),
      });
    } else if (type === 'Assessment Report') {
      summary = `Summary of practical programming tasks and technical assessments completed by ${candidate.name}.`;
      sections.push({
        title: 'Practical Submissions & Evaluations',
        content: `Candidate completed ${candidateSubmissions.length} practical coding challenges and ${candidateAssessments.length} formal assessments.`,
        items: [
          ...candidateSubmissions.map(
            (sub) => `Challenge: ${sub.filename || 'Code submission'} → Result: ${sub.result} (${sub.scorePercentage}%). Breakdown: ${sub.explainableBreakdown.join('; ')}`
          ),
          ...candidateAssessments.map(
            (ass) => `Assessment: ${ass.title} (${ass.category}) → Score: ${ass.scoreExplainable}. Verified Skills: ${ass.verifiedSkills.join(', ')}`
          ),
        ],
      });
    } else {
      summary = `Hiring decision support report synthesizing candidate proof profile, confidence indicators, and recommended interview validations.`;
      sections.push({
        title: 'Recruiter Decision Support',
        content: `Overall Evidence State: ${supportedCount >= 3 ? 'High Confidence in Core Skills' : 'Requires Targeted Validation'}.`,
        items: [
          `Verified Competencies Ready for Interview: ${provenSkills.join(', ') || 'None verified yet'}`,
          `Topics Requiring Live Recruiter Probe: ${gaps.map((g) => g.name).join(', ') || 'None'}`,
          `Discrepancies to Address: ${conflictingClaims.map((c) => c.title).join(', ') || 'Zero conflicts detected'}`,
        ],
      });
    }

    return {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      candidateId: candidate.id,
      candidateName: candidate.name,
      generatedAt: new Date().toISOString(),
      summary,
      sections,
    };
  },
};
