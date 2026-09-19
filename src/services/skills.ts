import { Skill, EvidenceItem, EvidenceStrength } from '../types';

export const skillsService = {
  createSkillsFromExtracted: (
    candidateId: string,
    extractedSkills: { name: string; category: Skill['category']; level: string }[]
  ): Skill[] => {
    return extractedSkills.map((item, idx) => ({
      id: `skill-${idx}-${Date.now()}`,
      candidateId,
      name: item.name,
      category: item.category,
      resumeClaimLevel: item.level,
      evidenceCount: 0,
      verificationState: 'Insufficient Evidence',
      evidenceStrength: 'None',
      missingProofReason: `Claimed on resume as "${item.level}", but no supporting code, repository, or assessment has been uploaded yet.`,
      recommendedValidation: `Assign role-specific ${item.name} practical challenge.`,
      relatedProjectIds: [],
      relatedEvidenceIds: [],
      isProven: false,
    }));
  },

  recalculateSkillVerification: (skill: Skill, allEvidence: EvidenceItem[]): Skill => {
    const relatedEvidence = allEvidence.filter(
      (ev) =>
        ev.relatedSkillIds.includes(skill.id) ||
        (ev.extractionSnippet && ev.extractionSnippet.toLowerCase().includes(skill.name.toLowerCase())) ||
        (ev.filename && ev.filename.toLowerCase().includes(skill.name.toLowerCase()))
    );

    const evidenceCount = relatedEvidence.length;
    const hasConflicting = relatedEvidence.some((ev) => ev.status === 'CONFLICTING');
    const hasPracticalChallenge = relatedEvidence.some((ev) => ev.evidenceType === 'Practical Challenge' && ev.status === 'SUPPORTED');
    const hasSourceCode = relatedEvidence.some((ev) => ev.evidenceType === 'Source Code' && ev.status === 'SUPPORTED');
    const hasCert = relatedEvidence.some((ev) => ev.evidenceType === 'Certificate');

    if (hasConflicting) {
      return {
        ...skill,
        evidenceCount,
        verificationState: 'Conflicting',
        evidenceStrength: 'Weak',
        missingProofReason: 'Discrepancy detected between claimed experience and submitted credential/evidence.',
        recommendedValidation: 'Recruiter manual audit required.',
        relatedEvidenceIds: relatedEvidence.map((e) => e.id),
        isProven: false,
      };
    }

    if (evidenceCount === 0) {
      return {
        ...skill,
        evidenceCount: 0,
        verificationState: 'Insufficient Evidence',
        evidenceStrength: 'None',
        missingProofReason: 'Zero technical artifacts or code samples provided.',
        recommendedValidation: `Complete ${skill.name} role challenge.`,
        relatedEvidenceIds: [],
        isProven: false,
      };
    }

    let strength: EvidenceStrength = 'Weak';
    if (hasPracticalChallenge && hasSourceCode) {
      strength = 'Production Grade';
    } else if (hasSourceCode || (hasCert && evidenceCount >= 2)) {
      strength = 'High';
    } else if (evidenceCount >= 1) {
      strength = 'Moderate';
    }

    let state: Skill['verificationState'] = 'Partially Supported';
    let isProven = false;
    let missing = 'Additional production artifacts recommended.';

    if (strength === 'Production Grade' || (strength === 'High' && evidenceCount >= 2)) {
      state = 'Supported';
      isProven = true;
      missing = 'Fully supported with visible code & challenge evidence.';
    } else {
      missing = hasSourceCode ? 'Requires practical challenge validation.' : 'Missing production-grade code samples.';
    }

    return {
      ...skill,
      evidenceCount,
      verificationState: state,
      evidenceStrength: strength,
      missingProofReason: missing,
      recommendedValidation: isProven ? 'Ready for recruiter review' : `Practical ${skill.name} challenge`,
      relatedEvidenceIds: relatedEvidence.map((e) => e.id),
      isProven,
    };
  },
};
