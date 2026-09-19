import { EvidenceItem, EvidenceCategory, Skill, Project } from '../types';
import { detectCategoryFromFilename } from './uploads';

export const evidenceService = {
  createFromUpload: (
    candidateId: string,
    file: File,
    textContent?: string,
    dataUrl?: string,
    skills: Skill[] = [],
    projects: Project[] = []
  ): EvidenceItem => {
    const evidenceType: EvidenceCategory = detectCategoryFromFilename(file.name);

    // Auto-detect skills matching filename or text
    const lowerContent = `${file.name} ${textContent || ''}`.toLowerCase();
    const matchedSkillIds = skills
      .filter((s) => lowerContent.includes(s.name.toLowerCase()))
      .map((s) => s.id);

    const matchedProjectIds = projects
      .filter((p) => lowerContent.includes(p.name.toLowerCase()))
      .map((p) => p.id);

    // Check potential conflicts heuristic
    let conflicts: string | undefined = undefined;
    let status: EvidenceItem['status'] = 'EXTRACTED';

    if (evidenceType === 'Certificate' && lowerContent.includes('associate') && lowerContent.includes('professional')) {
      conflicts = 'Badge indicates Associate level, while candidate claim specifies Professional level.';
      status = 'CONFLICTING';
    } else if (matchedSkillIds.length > 0 || matchedProjectIds.length > 0) {
      status = 'SUPPORTED';
    } else {
      status = 'UNVERIFIED';
    }

    const snippet = textContent
      ? textContent.substring(0, 220).replace(/\s+/g, ' ') + (textContent.length > 220 ? '...' : '')
      : `Uploaded ${file.name} (${(file.size / 1024).toFixed(1)} KB) into evidence vault.`;

    return {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      candidateId,
      filename: file.name,
      source: 'Direct Upload',
      evidenceType,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      relatedSkillIds: matchedSkillIds,
      relatedProjectIds: matchedProjectIds,
      status,
      extractionSnippet: snippet,
      rawContent: textContent,
      fileDataUrl: dataUrl,
      conflicts,
      humanReviewed: false,
      confidenceScore: matchedSkillIds.length > 0 ? 90 : 70,
    };
  },
};
