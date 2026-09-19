import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Candidate,
  Claim,
  Skill,
  Project,
  Experience,
  Certificate,
  EvidenceItem,
  EvidenceRelationship,
  PracticalChallenge,
  ChallengeSubmission,
  Assessment,
  VerificationEvent,
  ImportJob,
  UploadedFileItem,
  Report,
} from '../types';
import {
  DEV_CANDIDATE,
  DEV_CLAIMS,
  DEV_SKILLS,
  DEV_PROJECTS,
  DEV_EXPERIENCES,
  DEV_CERTIFICATES,
  DEV_EVIDENCE,
  DEV_RELATIONSHIPS,
  DEV_PRACTICAL_CHALLENGES,
  DEV_SUBMISSIONS,
  DEV_ASSESSMENTS,
  DEV_TIMELINE,
} from '../data/developmentData';
import { extractFromResumeText, readFileAsText, readFileAsDataURL, detectCategoryFromFilename, uploadResumeToBackend, uploadEvidenceToBackend } from '../services/uploads';
import { candidatesService } from '../services/candidates';
import { claimsService } from '../services/claims';
import { skillsService } from '../services/skills';
import { evidenceService } from '../services/evidence';
import { challengesService, ALL_CHALLENGES } from '../services/challenges';
import { verificationService } from '../services/verification';
import { apiClient, setAuthToken, clearAuthToken } from '../services/api';

export type AppView =
  | 'overview'
  | 'candidates'
  | 'candidate-profile'
  | 'upload-center'
  | 'claims'
  | 'skills'
  | 'evidence'
  | 'claim-vs-proof'
  | 'challenges'
  | 'evidence-graph'
  | 'assessments'
  | 'verification'
  | 'reports'
  | 'import-center'
  | 'settings';

interface AppContextType {
  currentView: AppView;
  navigateTo: (view: AppView) => void;
  candidates: Candidate[];
  activeCandidate: Candidate | null;
  setActiveCandidateId: (id: string) => void;
  claims: Claim[];
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  certificates: Certificate[];
  evidence: EvidenceItem[];
  relationships: EvidenceRelationship[];
  challenges: PracticalChallenge[];
  submissions: ChallengeSubmission[];
  assessments: Assessment[];
  timeline: VerificationEvent[];
  auditLogs: VerificationEvent[];
  importJobs: ImportJob[];
  uploadedQueue: UploadedFileItem[];
  isProcessingUpload: boolean;
  uploadError: string | null;
  // Actions
  uploadResumeFile: (file: File) => Promise<string>;
  uploadEvidenceFiles: (files: File[], targetCandidateId?: string) => Promise<void>;
  submitChallengeWork: (
    challengeId: string,
    submissionType: ChallengeSubmission['submissionType'],
    content: string,
    filename?: string
  ) => Promise<ChallengeSubmission>;
  submitChallengeSolution: (
    challengeId: string,
    submissionType: ChallengeSubmission['submissionType'],
    content: string,
    filename?: string
  ) => Promise<ChallengeSubmission>;
  markClaimReview: (claimId: string, reviewed: boolean, notes?: string) => void;
  updateEvidenceStatus: (evidenceId: string, status: EvidenceItem['status'], comment?: string) => void;
  confirmImportJob: (job: ImportJob) => void;
  importRecords: (records: any[]) => number;
  removeEvidence: (id: string) => void;
  deleteCandidate: (id: string) => void;
  resetToDevelopmentData: () => void;
  clearAllCandidates: () => void;
  clearAllData: () => void;
  // Search & Preview modals
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  previewEvidence: EvidenceItem | null;
  setPreviewEvidence: (item: EvidenceItem | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('overview');

  // Core entities
  const [candidates, setCandidates] = useState<Candidate[]>([DEV_CANDIDATE]);
  const [activeCandidateId, setActiveCandidateId] = useState<string>(DEV_CANDIDATE.id);

  const [claims, setClaims] = useState<Claim[]>(DEV_CLAIMS);
  const [skills, setSkills] = useState<Skill[]>(DEV_SKILLS);
  const [projects, setProjects] = useState<Project[]>(DEV_PROJECTS);
  const [experiences, setExperiences] = useState<Experience[]>(DEV_EXPERIENCES);
  const [certificates, setCertificates] = useState<Certificate[]>(DEV_CERTIFICATES);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(DEV_EVIDENCE);
  const [relationships, setRelationships] = useState<EvidenceRelationship[]>(DEV_RELATIONSHIPS);
  const [challenges, setChallenges] = useState<PracticalChallenge[]>(ALL_CHALLENGES);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>(DEV_SUBMISSIONS);
  const [assessments, setAssessments] = useState<Assessment[]>(DEV_ASSESSMENTS);
  const [timeline, setTimeline] = useState<VerificationEvent[]>(DEV_TIMELINE);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);

  // UI state
  const [uploadedQueue, setUploadedQueue] = useState<UploadedFileItem[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [previewEvidence, setPreviewEvidence] = useState<EvidenceItem | null>(null);

  const activeCandidate = candidates.find((c) => c.id === activeCandidateId) || candidates[0] || null;

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Complete Zero-Manual-Data Ingestion Pipeline
   * Uses backend API for processing
   */
  const uploadResumeFile = async (file: File): Promise<string> => {
    setIsProcessingUpload(true);
    setUploadError(null);

    try {
      // Upload to backend
      const result = await uploadResumeToBackend(file);
      const newCandidateId = result.candidate.id;

      // Refresh candidates list
      const updatedCandidates = await candidatesService.getAll();
      setCandidates(updatedCandidates);
      setActiveCandidateId(newCandidateId);

      // Add to uploaded queue
      const queueItem: UploadedFileItem = {
        id: `queue-${Date.now()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        extension: file.name.split('.').pop() || '',
        uploadStatus: 'Completed',
        processingStatus: 'Extracted',
        extractedSummary: `Detected: ${result.candidate.name} (${result.candidate.detected_role})`,
        evidenceCategory: 'Resume',
        confidence: 'High',
        textContent: result.resume?.raw_text || '',
      };
      setUploadedQueue((prev) => [queueItem, ...prev]);

      setIsProcessingUpload(false);
      return newCandidateId;
    } catch (err: any) {
      setIsProcessingUpload(false);
      setUploadError(err.message || 'Failed to process resume file');
      throw err;
    }
  };

  /**
   * Evidence Upload for Supporting Artifacts using backend API
   */
  const uploadEvidenceFiles = async (files: File[], targetCandidateId?: string) => {
    setIsProcessingUpload(true);
    setUploadError(null);
    const candidateId = targetCandidateId || activeCandidateId;

    try {
      // Upload to backend
      const result = await uploadEvidenceToBackend(files, candidateId);

      // Refresh evidence list
      // This would require implementing evidenceService.getAll
      // For now, add the new evidence to local state
      const newEvidenceItems: EvidenceItem[] = result.map((ev: any) => ({
        id: ev.id,
        candidateId: ev.candidate_id,
        filename: ev.filename,
        source: ev.source,
        evidenceType: ev.evidence_type,
        fileSize: ev.file_size,
        fileType: ev.file_type,
        uploadedAt: ev.uploaded_at,
        relatedSkillIds: [],
        relatedProjectIds: [],
        status: ev.status,
        extractionSnippet: ev.extraction_snippet,
        rawContent: ev.raw_content,
        humanReviewed: ev.human_reviewed,
        confidenceScore: ev.confidence_score,
      }));

      setEvidence((prev) => [...newEvidenceItems, ...prev]);

      setIsProcessingUpload(false);
    } catch (err: any) {
      setIsProcessingUpload(false);
      setUploadError(err.message || 'Error processing evidence files');
      throw err;
    }
  };

  /**
   * Submit practical challenge
   */
  const submitChallengeWork = async (
    challengeId: string,
    submissionType: ChallengeSubmission['submissionType'],
    content: string,
    filename?: string
  ): Promise<ChallengeSubmission> => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const sub = challengesService.evaluateSubmission(
      challenge,
      activeCandidateId,
      submissionType,
      content,
      filename
    );

    setSubmissions((prev) => [sub, ...prev]);

    // Create supporting evidence item for this submission
    const evItem: EvidenceItem = {
      id: `ev-sub-${Date.now()}`,
      candidateId: activeCandidateId,
      filename: filename || `${challenge.skillTested.toLowerCase()}_challenge_submission.txt`,
      source: 'Practical Challenge Engine',
      evidenceType: 'Practical Challenge',
      fileSize: content.length,
      fileType: 'text/plain',
      uploadedAt: new Date().toISOString(),
      relatedSkillIds: skills.filter((s) => s.name.toLowerCase() === challenge.skillTested.toLowerCase()).map((s) => s.id),
      relatedProjectIds: [],
      status: sub.result.includes('Pass') ? 'SUPPORTED' : 'PARTIALLY SUPPORTED',
      extractionSnippet: `Candidate completed practical challenge "${challenge.title}" (${sub.result} - ${sub.scorePercentage}%).`,
      rawContent: content,
      confidenceScore: sub.scorePercentage,
      humanReviewed: true,
      reviewerComment: `Automated proof evaluation: ${sub.explainableBreakdown.join('; ')}`,
    };

    setEvidence((prev) => [evItem, ...prev]);

    // Upgrade tested skill to Proven / Supported if passed
    if (sub.result.includes('Pass')) {
      setSkills((prev) =>
        prev.map((s) => {
          if (s.candidateId === activeCandidateId && s.name.toLowerCase() === challenge.skillTested.toLowerCase()) {
            return {
              ...s,
              isProven: true,
              verificationState: 'Supported',
              evidenceStrength: 'Production Grade',
              evidenceCount: s.evidenceCount + 1,
              missingProofReason: 'Verified via practical role challenge submission.',
              recommendedValidation: 'Validated by Practical Challenge Engine',
              relatedEvidenceIds: [...s.relatedEvidenceIds, evItem.id],
            };
          }
          return s;
        })
      );

      // Also upgrade matching claim
      setClaims((prev) =>
        prev.map((c) => {
          if (c.candidateId === activeCandidateId && c.title.toLowerCase() === challenge.skillTested.toLowerCase()) {
            return {
              ...c,
              evidenceStatus: 'Supported',
              evidenceIds: [...c.evidenceIds, evItem.id],
              reviewedByHuman: true,
              reviewerNotes: `Validated by candidate submission in practical challenge: ${challenge.title}.`,
            };
          }
          return c;
        })
      );
    }

    // Log timeline
    const evt = verificationService.createEvent(
      activeCandidateId,
      'Challenge Submitted',
      activeCandidate?.name || 'Candidate',
      `Submitted solution for "${challenge.title}". Result: ${sub.result} (${sub.scorePercentage}%).`,
      sub.id
    );
    setTimeline((prev) => [evt, ...prev]);

    return sub;
  };

  const markClaimReview = (claimId: string, reviewed: boolean, notes?: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, reviewedByHuman: reviewed, reviewerNotes: notes || c.reviewerNotes } : c))
    );

    const claim = claims.find((c) => c.id === claimId);
    if (claim) {
      const evt = verificationService.createEvent(
        claim.candidateId,
        'Human Review',
        'Lead Technical Recruiter',
        `Marked claim "${claim.title}" as ${reviewed ? 'Reviewed' : 'Flagged for Review'}.${notes ? ` Note: ${notes}` : ''}`
      );
      setTimeline((prev) => [evt, ...prev]);
    }
  };

  const updateEvidenceStatus = (evidenceId: string, status: EvidenceItem['status'], comment?: string) => {
    setEvidence((prev) =>
      prev.map((e) =>
        e.id === evidenceId
          ? { ...e, status, humanReviewed: true, reviewerComment: comment || e.reviewerComment }
          : e
      )
    );
  };

  const removeEvidence = (id: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
  };

  const deleteCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    setClaims((prev) => prev.filter((c) => c.candidateId !== id));
    setSkills((prev) => prev.filter((s) => s.candidateId !== id));
    setProjects((prev) => prev.filter((p) => p.candidateId !== id));
    setEvidence((prev) => prev.filter((e) => e.candidateId !== id));
    setTimeline((prev) => prev.filter((t) => t.candidateId !== id));
    if (activeCandidateId === id) {
      const remaining = candidates.filter((c) => c.id !== id);
      setActiveCandidateId(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  const confirmImportJob = (job: ImportJob) => {
    const newCandidates: Candidate[] = [];
    const newClaims: Claim[] = [];
    const newSkills: Skill[] = [];

    job.records.forEach((rec, idx) => {
      const candId = `cand-imp-${Date.now()}-${idx}`;
      const skillsArray = typeof rec.skills === 'string' ? rec.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

      const cand: Candidate = {
        id: candId,
        name: rec.name,
        email: rec.email,
        detectedRole: rec.role || 'Software Engineer',
        targetRole: rec.role || 'Software Engineer',
        summary: `Imported via ${job.fileType} dataset (${job.filename}).`,
        keySkills: skillsArray,
        education: rec.education ? { degree: rec.education, institution: 'Imported', graduationYear: 'N/A' } : undefined,
        links: {
          github: rec.github || undefined,
          linkedin: rec.linkedin || undefined,
        },
        isDevelopmentData: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newCandidates.push(cand);

      // Create claims
      skillsArray.forEach((sk, sIdx) => {
        newClaims.push({
          id: `claim-imp-${candId}-${sIdx}`,
          candidateId: candId,
          title: sk,
          claimType: 'Technical Skill',
          source: 'Self-Reported',
          description: `Imported record indicates skill "${sk}". Requires evidence upload.`,
          declaredLevel: 'Not Specified',
          evidenceStatus: 'Unverified',
          evidenceIds: [],
          reviewedByHuman: false,
          createdAt: new Date().toISOString(),
        });

        newSkills.push({
          id: `skill-imp-${candId}-${sIdx}`,
          candidateId: candId,
          name: sk,
          category: 'Language',
          resumeClaimLevel: 'Imported Record',
          evidenceCount: 0,
          verificationState: 'Insufficient Evidence',
          evidenceStrength: 'None',
          missingProofReason: 'Imported without attached source code or portfolio evidence.',
          recommendedValidation: `Assign practical challenge in ${sk}.`,
          relatedProjectIds: [],
          relatedEvidenceIds: [],
          isProven: false,
        });
      });
    });

    setCandidates((prev) => [...newCandidates, ...prev]);
    setClaims((prev) => [...newClaims, ...prev]);
    setSkills((prev) => [...newSkills, ...prev]);
    setImportJobs((prev) => [{ ...job, status: 'Imported' }, ...prev]);
    if (newCandidates.length > 0) {
      setActiveCandidateId(newCandidates[0].id);
    }
    navigateTo('candidates');
  };

  const resetToDevelopmentData = () => {
    setCandidates([DEV_CANDIDATE]);
    setActiveCandidateId(DEV_CANDIDATE.id);
    setClaims(DEV_CLAIMS);
    setSkills(DEV_SKILLS);
    setProjects(DEV_PROJECTS);
    setExperiences(DEV_EXPERIENCES);
    setCertificates(DEV_CERTIFICATES);
    setEvidence(DEV_EVIDENCE);
    setRelationships(DEV_RELATIONSHIPS);
    setSubmissions(DEV_SUBMISSIONS);
    setAssessments(DEV_ASSESSMENTS);
    setTimeline(DEV_TIMELINE);
    setUploadedQueue([]);
  };

  const clearAllCandidates = () => {
    setCandidates([]);
    setActiveCandidateId('');
    setClaims([]);
    setSkills([]);
    setProjects([]);
    setExperiences([]);
    setCertificates([]);
    setEvidence([]);
    setRelationships([]);
    setSubmissions([]);
    setAssessments([]);
    setTimeline([]);
    setUploadedQueue([]);
  };

  const importRecords = (records: any[]): number => {
    const newCandidates: Candidate[] = [];
    const newClaims: Claim[] = [];
    const newSkills: Skill[] = [];

    records.forEach((rec, idx) => {
      const candId = `cand-imp-${Date.now()}-${idx}`;
      const skillsArray = Array.isArray(rec.keySkills)
        ? rec.keySkills
        : typeof rec.skills === 'string'
        ? rec.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      const cand: Candidate = {
        id: candId,
        name: rec.name,
        email: rec.email,
        detectedRole: rec.detectedRole || rec.role || 'Software Engineer',
        targetRole: rec.detectedRole || rec.role || 'Software Engineer',
        summary: rec.summary || `Imported profile with ${skillsArray.length} key skills.`,
        keySkills: skillsArray,
        links: {
          github: rec.github || undefined,
          linkedin: rec.linkedin || undefined,
        },
        isDevelopmentData: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newCandidates.push(cand);

      skillsArray.forEach((sk: string, sIdx: number) => {
        newClaims.push({
          id: `claim-imp-${candId}-${sIdx}`,
          candidateId: candId,
          title: sk,
          claimType: 'Technical Skill',
          source: 'Resume',
          description: `Imported technical assertion for skill: ${sk}`,
          evidenceStatus: 'Unverified',
          evidenceIds: [],
          reviewedByHuman: false,
          createdAt: new Date().toISOString(),
        });

        newSkills.push({
          id: `skill-imp-${candId}-${sIdx}`,
          candidateId: candId,
          name: sk,
          category: 'Language',
          resumeClaimLevel: 'Imported Skill',
          evidenceCount: 0,
          verificationState: 'Insufficient Evidence',
          evidenceStrength: 'None',
          missingProofReason: 'Imported record without attached repository evidence.',
          recommendedValidation: `Complete a practical coding challenge in ${sk}.`,
          relatedProjectIds: [],
          relatedEvidenceIds: [],
          isProven: false,
        });
      });
    });

    setCandidates((prev) => [...newCandidates, ...prev]);
    setClaims((prev) => [...newClaims, ...prev]);
    setSkills((prev) => [...newSkills, ...prev]);
    if (newCandidates.length > 0) {
      setActiveCandidateId(newCandidates[0].id);
    }
    return newCandidates.length;
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        navigateTo,
        candidates,
        activeCandidate,
        setActiveCandidateId,
        claims,
        skills,
        projects,
        experiences,
        certificates,
        evidence,
        relationships,
        challenges,
        submissions,
        assessments,
        timeline,
        auditLogs: timeline,
        importJobs,
        uploadedQueue,
        isProcessingUpload,
        uploadError,
        uploadResumeFile,
        uploadEvidenceFiles,
        submitChallengeWork,
        submitChallengeSolution: submitChallengeWork,
        markClaimReview,
        updateEvidenceStatus,
        confirmImportJob,
        importRecords,
        removeEvidence,
        deleteCandidate,
        resetToDevelopmentData,
        clearAllCandidates,
        clearAllData: clearAllCandidates,
        searchQuery,
        setSearchQuery,
        previewEvidence,
        setPreviewEvidence,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
