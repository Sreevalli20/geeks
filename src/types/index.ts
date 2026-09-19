export type VerificationStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'EXTRACTED'
  | 'UNVERIFIED'
  | 'SUPPORTED'
  | 'PARTIALLY SUPPORTED'
  | 'CONFLICTING'
  | 'INSUFFICIENT'
  | 'REQUIRES HUMAN REVIEW';

export type ClaimType =
  | 'Technical Skill'
  | 'Project Achievement'
  | 'Work Experience'
  | 'Education'
  | 'Certification';

export type EvidenceCategory =
  | 'Resume'
  | 'Project'
  | 'Source Code'
  | 'Portfolio'
  | 'Certificate'
  | 'Screenshot'
  | 'Documentation'
  | 'Assessment'
  | 'Practical Challenge'
  | 'Achievement'
  | 'Other';

export type EvidenceStrength = 'None' | 'Weak' | 'Moderate' | 'High' | 'Production Grade';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  detectedRole: string;
  targetRole?: string;
  summary: string;
  education?: {
    degree: string;
    institution: string;
    graduationYear: string;
  };
  keySkills: string[];
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  isDevelopmentData?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  candidateId: string;
  filename: string;
  fileSize: number;
  uploadedAt: string;
  rawText: string;
  parseStatus: 'Parsed' | 'Requires Review' | 'Error';
  extractedSkillsCount: number;
  extractedProjectsCount: number;
}

export interface Claim {
  id: string;
  candidateId: string;
  title: string;
  claimType: ClaimType;
  source: 'Resume' | 'Project Documentation' | 'Self-Reported' | 'Portfolio';
  description: string;
  declaredLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Not Specified';
  evidenceStatus: 'Unverified' | 'Supported' | 'Partially Supported' | 'Conflicting' | 'Insufficient Evidence' | 'Requires Human Review';
  evidenceIds: string[];
  reviewerNotes?: string;
  reviewedByHuman?: boolean;
  reviewedAt?: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  candidateId: string;
  name: string;
  category: 'Language' | 'Framework' | 'Database' | 'Tool' | 'Cloud/DevOps' | 'Architecture' | 'Concept';
  resumeClaimLevel: string;
  evidenceCount: number;
  verificationState: 'Supported' | 'Partially Supported' | 'Insufficient Evidence' | 'Conflicting' | 'Not Yet Verified';
  evidenceStrength: EvidenceStrength;
  missingProofReason?: string;
  recommendedValidation?: string;
  relatedProjectIds: string[];
  relatedEvidenceIds: string[];
  isProven: boolean;
}

export interface Project {
  id: string;
  candidateId: string;
  name: string;
  description: string;
  duration?: string;
  role?: string;
  claimedSkills: string[];
  evidenceIds: string[];
  verificationStatus: 'Unverified' | 'Supported' | 'Partially Supported' | 'Conflicting' | 'Insufficient Evidence';
  repoUrl?: string;
  demoUrl?: string;
}

export interface Experience {
  id: string;
  candidateId: string;
  company: string;
  role: string;
  period: string;
  description: string;
  claimedSkills: string[];
  verifiedSkills: string[];
}

export interface Certificate {
  id: string;
  candidateId: string;
  title: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
  credentialId?: string;
  evidenceId?: string;
  verificationStatus: 'Unverified' | 'Supported' | 'Requires Human Review';
}

export interface EvidenceItem {
  id: string;
  candidateId: string;
  filename: string;
  source: string;
  evidenceType: EvidenceCategory;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  relatedSkillIds: string[];
  relatedProjectIds: string[];
  status: VerificationStatus;
  extractionSnippet?: string;
  rawContent?: string;
  fileDataUrl?: string;
  conflicts?: string;
  missingInformation?: string;
  humanReviewed?: boolean;
  reviewerComment?: string;
  confidenceScore?: number; // 0 - 100 explainable
}

export type RelationshipType =
  | 'CLAIMS'
  | 'SUPPORTS'
  | 'PARTIALLY_SUPPORTS'
  | 'CONFLICTS_WITH'
  | 'PROVES'
  | 'BELONGS_TO'
  | 'ASSESSES'
  | 'VERIFIED_BY'
  | 'REQUIRES_REVIEW';

export interface EvidenceRelationship {
  id: string;
  sourceId: string;
  sourceType: 'Candidate' | 'Resume' | 'Claim' | 'Skill' | 'Project' | 'Evidence' | 'Assessment' | 'Challenge';
  sourceLabel: string;
  targetId: string;
  targetType: 'Candidate' | 'Resume' | 'Claim' | 'Skill' | 'Project' | 'Evidence' | 'Assessment' | 'Challenge';
  targetLabel: string;
  relationship: RelationshipType;
  confidence: number;
  explanation: string;
}

export interface PracticalChallenge {
  id: string;
  role: string;
  title: string;
  skillTested: string;
  difficulty: 'Junior' | 'Mid' | 'Senior' | 'Staff';
  whyRecommended: string;
  promptText: string;
  description?: string;
  category?: string;
  instructions: string[];
  starterCode?: string;
  expectedOutput: string;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  candidateId: string;
  submissionType: 'code' | 'text' | 'file' | 'screenshot';
  content: string;
  filename?: string;
  submittedAt: string;
  evaluationEvidence: string;
  result: 'Pass - Strong Proof' | 'Pass - Adequate' | 'Needs Improvement' | 'Failed';
  provenSkills: string[];
  scorePercentage: number;
  totalScore?: number;
  explainableBreakdown: string[];
}

export interface Assessment {
  id: string;
  candidateId: string;
  title: string;
  category: string;
  date: string;
  scoreExplainable: string;
  score?: number;
  rubricBreakdown?: {
    correctness: number;
    codeQuality: number;
    performance: number;
    security: number;
    architecture: number;
  };
  verifiedSkills: string[];
  status: 'Completed' | 'Pending';
  evidenceId?: string;
}

export interface VerificationEvent {
  id: string;
  candidateId: string;
  timestamp: string;
  eventType:
    | 'Resume Uploaded'
    | 'Claims Extracted'
    | 'Evidence Uploaded'
    | 'Evidence Connected'
    | 'Assessment Completed'
    | 'Challenge Submitted'
    | 'Verification Performed'
    | 'Human Review';
  actor: string;
  details: string;
  action?: string;
  sourceRef?: string;
}

export interface SkillAnalysis {
  candidateId: string;
  totalClaims: number;
  supportedSkills: number;
  partiallySupportedSkills: number;
  insufficientSkills: number;
  conflictingClaims: number;
  humanReviewRequired: number;
  explainableSummary: string;
}

export interface ProofProfile {
  candidateId: string;
  provenSkills: string[];
  claimedSkills: string[];
  gaps: { skill: string; reason: string; recommendation: string }[];
  conflicts: { claim: string; evidence: string; discrepancy: string }[];
  timeline: VerificationEvent[];
}

export interface Report {
  id: string;
  type:
    | 'Candidate Proof Report'
    | 'Skill Evidence Report'
    | 'Recruiter Evidence Report'
    | 'Assessment Report'
    | 'Claim vs Proof Report';
  candidateId: string;
  candidateName: string;
  generatedAt: string;
  summary: string;
  sections: { title: string; content: string; items?: string[] }[];
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  uploadStatus: 'Queued' | 'Uploading' | 'Completed' | 'Failed';
  processingStatus: 'Pending' | 'Analyzing' | 'Extracted' | 'Error';
  extractedSummary?: string;
  evidenceCategory: EvidenceCategory;
  confidence: 'High' | 'Medium' | 'Low' | 'Requires Review';
  previewUrl?: string;
  textContent?: string;
  error?: string;
}

export interface ImportCandidateRecord {
  name: string;
  email: string;
  role?: string;
  detectedRole?: string;
  skills?: string;
  keySkills?: string[];
  claims?: { title: string; description: string; claimType: string; evidenceStatus: string }[];
  experienceYears?: string | number;
  education?: string;
  github?: string;
  linkedin?: string;
  status?: string;
  [key: string]: any;
}

export interface ImportJob {
  id: string;
  filename: string;
  fileType: 'JSON' | 'CSV';
  uploadedAt: string;
  recordsDetected: number;
  validRecords: number;
  invalidRecords: number;
  duplicates: number;
  fieldsDetected: string[];
  status: 'Validated' | 'Imported' | 'Cancelled' | 'Error';
  records: ImportCandidateRecord[];
  errors: string[];
}
