import { Claim } from '../types';

export const claimsService = {
  createFromSkillsAndProjects: (
    candidateId: string,
    skills: { name: string; level?: string }[],
    projects: { name: string; description: string; skills: string[] }[]
  ): Claim[] => {
    const claims: Claim[] = [];

    // Technical Skill Claims
    skills.forEach((sk, idx) => {
      claims.push({
        id: `claim-sk-${idx}-${Date.now()}`,
        candidateId,
        title: sk.name,
        claimType: 'Technical Skill',
        source: 'Resume',
        description: `Candidate claims proficiency in ${sk.name} (${sk.level || 'Mentioned in resume'}).`,
        declaredLevel: (sk.level as any) || 'Not Specified',
        evidenceStatus: 'Unverified',
        evidenceIds: [],
        reviewedByHuman: false,
        createdAt: new Date().toISOString(),
      });
    });

    // Project Claims
    projects.forEach((proj, idx) => {
      claims.push({
        id: `claim-proj-${idx}-${Date.now()}`,
        candidateId,
        title: proj.name,
        claimType: 'Project Achievement',
        source: 'Resume',
        description: proj.description,
        declaredLevel: 'Not Specified',
        evidenceStatus: 'Unverified',
        evidenceIds: [],
        reviewedByHuman: false,
        createdAt: new Date().toISOString(),
      });
    });

    return claims;
  },

  recomputeClaimStatus: (claim: Claim, matchingEvidenceIds: string[]): Claim => {
    if (claim.evidenceStatus === 'Conflicting') {
      return claim; // Preserve explicit conflict flag
    }
    if (matchingEvidenceIds.length === 0) {
      return { ...claim, evidenceStatus: 'Insufficient Evidence', evidenceIds: [] };
    }
    if (matchingEvidenceIds.length === 1) {
      return { ...claim, evidenceStatus: 'Partially Supported', evidenceIds: matchingEvidenceIds };
    }
    return { ...claim, evidenceStatus: 'Supported', evidenceIds: matchingEvidenceIds };
  },
};
