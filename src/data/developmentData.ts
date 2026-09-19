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
} from '../types';

export const DEV_CANDIDATE_ID = 'dev-cand-001';

export const DEV_CANDIDATE: Candidate = {
  id: DEV_CANDIDATE_ID,
  name: 'Alex Chen [DEV DATA]',
  email: 'alex.chen.devsample@example.com',
  phone: '+1 (555) 019-2834',
  location: 'Seattle, WA (Remote)',
  detectedRole: 'Senior Full-Stack & Systems Engineer',
  targetRole: 'Senior Software Engineer',
  summary:
    'Full-stack engineer with claimed 6+ years in distributed systems, TypeScript, Python, and cloud infrastructure. [Explicitly flagged as sample development candidate]',
  education: {
    degree: 'B.S. in Computer Science',
    institution: 'University of Washington',
    graduationYear: '2019',
  },
  keySkills: ['Python', 'TypeScript', 'React', 'Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'GraphQL', 'AWS'],
  links: {
    github: 'https://github.com/example/alexchen-dev-sample',
    linkedin: 'https://linkedin.com/in/example-alexchen-dev',
    portfolio: 'https://alexchen-dev-sample.example.com',
  },
  isDevelopmentData: true,
  createdAt: '2026-09-18T10:00:00Z',
  updatedAt: '2026-09-19T09:30:00Z',
};

export const DEV_CLAIMS: Claim[] = [
  {
    id: 'claim-1',
    candidateId: DEV_CANDIDATE_ID,
    title: 'Python Microservices & Concurrency',
    claimType: 'Technical Skill',
    source: 'Resume',
    description: 'Claimed "Expert" proficiency in Python (FastAPI, AsyncIO, PyTest, Celery) handling high-throughput queues.',
    declaredLevel: 'Expert',
    evidenceStatus: 'Supported',
    evidenceIds: ['ev-code-1', 'ev-proj-1', 'ev-chal-1'],
    reviewedByHuman: true,
    reviewerNotes: 'Verified via uploaded async worker repository & practical concurrency challenge.',
    createdAt: '2026-09-18T10:05:00Z',
  },
  {
    id: 'claim-2',
    candidateId: DEV_CANDIDATE_ID,
    title: 'PostgreSQL Query Optimization & Partitioning',
    claimType: 'Technical Skill',
    source: 'Resume',
    description: 'Claimed "Advanced" knowledge in PostgreSQL table partitioning, indexing strategies, and connection pooling.',
    declaredLevel: 'Advanced',
    evidenceStatus: 'Supported',
    evidenceIds: ['ev-doc-1', 'ev-proj-1'],
    reviewedByHuman: false,
    createdAt: '2026-09-18T10:05:00Z',
  },
  {
    id: 'claim-3',
    candidateId: DEV_CANDIDATE_ID,
    title: 'Kubernetes Production Cluster Administration',
    claimType: 'Technical Skill',
    source: 'Resume',
    description: 'Claimed multi-region Kubernetes orchestrator management & Helm chart authoring.',
    declaredLevel: 'Advanced',
    evidenceStatus: 'Partially Supported',
    evidenceIds: ['ev-cert-1'],
    reviewedByHuman: false,
    reviewerNotes: 'Only CKAD certificate present. No live Helm charts or cluster manifests submitted in source code.',
    createdAt: '2026-09-18T10:05:00Z',
  },
  {
    id: 'claim-4',
    candidateId: DEV_CANDIDATE_ID,
    title: 'Go (Golang) High-Performance gRPC Services',
    claimType: 'Technical Skill',
    source: 'Resume',
    description: 'Claimed "3+ years production Go for ultra-low latency gRPC services".',
    declaredLevel: 'Advanced',
    evidenceStatus: 'Insufficient Evidence',
    evidenceIds: [],
    reviewedByHuman: false,
    reviewerNotes: 'No Go files, repositories, or assessments found in submitted bundle.',
    createdAt: '2026-09-18T10:05:00Z',
  },
  {
    id: 'claim-5',
    candidateId: DEV_CANDIDATE_ID,
    title: 'Led Distributed Task Queue Re-architecture',
    claimType: 'Project Achievement',
    source: 'Resume',
    description: 'Claimed "Cut p99 queue latency by 64% by migrating Celery workers to AsyncIO Redis Streams".',
    declaredLevel: 'Not Specified',
    evidenceStatus: 'Supported',
    evidenceIds: ['ev-proj-1', 'ev-doc-1'],
    reviewedByHuman: true,
    reviewerNotes: 'Architecture RFC document and benchmark graph cross-validated with git commit history.',
    createdAt: '2026-09-18T10:05:00Z',
  },
  {
    id: 'claim-6',
    candidateId: DEV_CANDIDATE_ID,
    title: 'AWS Certified Solutions Architect — Professional',
    claimType: 'Certification',
    source: 'Resume',
    description: 'Claimed active AWS SAP-C02 certification.',
    declaredLevel: 'Not Specified',
    evidenceStatus: 'Conflicting',
    evidenceIds: ['ev-cert-2'],
    reviewedByHuman: true,
    reviewerNotes: 'Uploaded credential badge shows AWS Associate level, not Professional level. Flagged for review.',
    createdAt: '2026-09-18T10:05:00Z',
  },
];

export const DEV_SKILLS: Skill[] = [
  {
    id: 'skill-1',
    candidateId: DEV_CANDIDATE_ID,
    name: 'Python',
    category: 'Language',
    resumeClaimLevel: 'Expert (6 yrs)',
    evidenceCount: 3,
    verificationState: 'Supported',
    evidenceStrength: 'Production Grade',
    missingProofReason: 'None. Code submission, architecture doc, and role challenge verified.',
    recommendedValidation: 'Ready for recruiter review.',
    relatedProjectIds: ['proj-1'],
    relatedEvidenceIds: ['ev-code-1', 'ev-proj-1', 'ev-chal-1'],
    isProven: true,
  },
  {
    id: 'skill-2',
    candidateId: DEV_CANDIDATE_ID,
    name: 'PostgreSQL',
    category: 'Database',
    resumeClaimLevel: 'Advanced (4 yrs)',
    evidenceCount: 2,
    verificationState: 'Supported',
    evidenceStrength: 'High',
    missingProofReason: 'None. Schema migrations and query EXPLAIN plans present in project doc.',
    recommendedValidation: 'Optional: DB indexing stress test.',
    relatedProjectIds: ['proj-1'],
    relatedEvidenceIds: ['ev-doc-1', 'ev-proj-1'],
    isProven: true,
  },
  {
    id: 'skill-3',
    candidateId: DEV_CANDIDATE_ID,
    name: 'Kubernetes',
    category: 'Cloud/DevOps',
    resumeClaimLevel: 'Advanced (3 yrs)',
    evidenceCount: 1,
    verificationState: 'Partially Supported',
    evidenceStrength: 'Moderate',
    missingProofReason: 'Certificate verified, but zero production IaC/Helm configs provided.',
    recommendedValidation: 'Practical K8s deployment & ingress configuration challenge.',
    relatedProjectIds: [],
    relatedEvidenceIds: ['ev-cert-1'],
    isProven: false,
  },
  {
    id: 'skill-4',
    candidateId: DEV_CANDIDATE_ID,
    name: 'Go (Golang)',
    category: 'Language',
    resumeClaimLevel: 'Advanced (3 yrs)',
    evidenceCount: 0,
    verificationState: 'Insufficient Evidence',
    evidenceStrength: 'None',
    missingProofReason: 'Resume mentions Go gRPC, but no code samples, projects, or tests exist in evidence.',
    recommendedValidation: 'Recommend Go Concurrency Practical Challenge.',
    relatedProjectIds: [],
    relatedEvidenceIds: [],
    isProven: false,
  },
  {
    id: 'skill-5',
    candidateId: DEV_CANDIDATE_ID,
    name: 'AWS Architecture',
    category: 'Cloud/DevOps',
    resumeClaimLevel: 'Professional Level',
    evidenceCount: 1,
    verificationState: 'Conflicting',
    evidenceStrength: 'Weak',
    missingProofReason: 'Resume claims Professional Architect cert, uploaded badge is Solutions Architect Associate.',
    recommendedValidation: 'Recruiter verification request or credential re-upload.',
    relatedProjectIds: [],
    relatedEvidenceIds: ['ev-cert-2'],
    isProven: false,
  },
  {
    id: 'skill-6',
    candidateId: DEV_CANDIDATE_ID,
    name: 'TypeScript & React',
    category: 'Framework',
    resumeClaimLevel: 'Intermediate-Advanced',
    evidenceCount: 2,
    verificationState: 'Supported',
    evidenceStrength: 'High',
    missingProofReason: 'Frontend dashboard code and live component tests available in portfolio.',
    recommendedValidation: 'Validated by component evidence.',
    relatedProjectIds: ['proj-2'],
    relatedEvidenceIds: ['ev-code-2', 'ev-screen-1'],
    isProven: true,
  },
];

export const DEV_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    candidateId: DEV_CANDIDATE_ID,
    name: 'Distributed Event Dispatcher',
    description: 'High-throughput async event ingestion pipeline built with Python FastAPI, Redis Streams, and PostgreSQL.',
    duration: '8 months (2024 - 2025)',
    role: 'Lead Backend Architect',
    claimedSkills: ['Python', 'FastAPI', 'Redis', 'PostgreSQL', 'Docker'],
    evidenceIds: ['ev-code-1', 'ev-doc-1'],
    verificationStatus: 'Supported',
    repoUrl: 'https://github.com/example/event-stream-dispatcher',
  },
  {
    id: 'proj-2',
    candidateId: DEV_CANDIDATE_ID,
    name: 'Telemetry Analytics Dashboard',
    description: 'Real-time observability console visualizing worker metrics and latency percentiles.',
    duration: '4 months (2024)',
    role: 'Full-Stack Developer',
    claimedSkills: ['TypeScript', 'React', 'Tailwind', 'GraphQL'],
    evidenceIds: ['ev-code-2', 'ev-screen-1'],
    verificationStatus: 'Supported',
    repoUrl: 'https://github.com/example/telemetry-dash',
    demoUrl: 'https://telemetry-dash-demo.example.com',
  },
];

export const DEV_EXPERIENCES: Experience[] = [
  {
    id: 'exp-1',
    candidateId: DEV_CANDIDATE_ID,
    company: 'Nexus Scale Technologies',
    role: 'Senior Backend Engineer',
    period: '2022 - Present',
    description: 'Architected async event processing services handling 45M messages/day. Maintained zero-downtime migrations.',
    claimedSkills: ['Python', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    verifiedSkills: ['Python', 'PostgreSQL', 'Redis'],
  },
  {
    id: 'exp-2',
    candidateId: DEV_CANDIDATE_ID,
    company: 'CloudVector Labs',
    role: 'Software Engineer',
    period: '2019 - 2022',
    description: 'Developed internal tooling and microservices in Go and Python. Automated CI/CD pipelines.',
    claimedSkills: ['Go', 'Python', 'AWS', 'Docker'],
    verifiedSkills: ['Python', 'Docker'],
  },
];

export const DEV_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    candidateId: DEV_CANDIDATE_ID,
    title: 'Certified Kubernetes Application Developer (CKAD)',
    issuer: 'Cloud Native Computing Foundation (CNCF)',
    issueDate: '2024-03-15',
    credentialUrl: 'https://ti-user-certificates.example.com/ckad-verified',
    evidenceId: 'ev-cert-1',
    verificationStatus: 'Supported',
  },
  {
    id: 'cert-2',
    candidateId: DEV_CANDIDATE_ID,
    title: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    issueDate: '2023-11-20',
    credentialUrl: 'https://aws.amazon.com/verification/example',
    evidenceId: 'ev-cert-2',
    verificationStatus: 'Requires Human Review',
  },
];

export const DEV_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-resume-1',
    candidateId: DEV_CANDIDATE_ID,
    filename: 'AlexChen_Senior_Systems_Resume.pdf',
    source: 'Direct Upload',
    evidenceType: 'Resume',
    fileSize: 184320,
    fileType: 'application/pdf',
    uploadedAt: '2026-09-18T10:00:00Z',
    relatedSkillIds: ['skill-1', 'skill-2', 'skill-3', 'skill-4', 'skill-5', 'skill-6'],
    relatedProjectIds: ['proj-1', 'proj-2'],
    status: 'EXTRACTED',
    extractionSnippet: 'Senior Full-Stack & Systems Engineer. 6+ years experience in Python, Go, Kubernetes, PostgreSQL.',
    rawContent: 'Alex Chen\nSeattle, WA | alex.chen.devsample@example.com\nSUMMARY: 6+ yrs distributed systems...',
    confidenceScore: 94,
    humanReviewed: true,
  },
  {
    id: 'ev-code-1',
    candidateId: DEV_CANDIDATE_ID,
    filename: 'async_worker_pool.py',
    source: 'GitHub Repository Upload',
    evidenceType: 'Source Code',
    fileSize: 42800,
    fileType: 'text/x-python',
    uploadedAt: '2026-09-18T10:12:00Z',
    relatedSkillIds: ['skill-1'],
    relatedProjectIds: ['proj-1'],
    status: 'SUPPORTED',
    extractionSnippet: 'class AsyncWorkerPool:\n    def __init__(self, concurrency: int = 32, redis_conn = None): ... asyncio.Semaphore ...',
    rawContent: 'import asyncio\nimport logging\nfrom typing import Callable, Any\n\nclass AsyncWorkerPool:\n    """Production worker pool with bounded concurrency and backpressure."""\n    def __init__(self, concurrency: int = 32):\n        self.sem = asyncio.Semaphore(concurrency)\n        self.active_tasks = set()\n',
    confidenceScore: 98,
    humanReviewed: true,
    reviewerComment: 'High code quality: Proper backpressure handling, typed signatures, and explicit clean shutdown logic.',
  },
  {
    id: 'ev-doc-1',
    candidateId: DEV_CANDIDATE_ID,
    filename: 'RFC-014_Redis_Streams_Migration.md',
    source: 'Architecture Documentation Upload',
    evidenceType: 'Documentation',
    fileSize: 65400,
    fileType: 'text/markdown',
    uploadedAt: '2026-09-18T10:14:00Z',
    relatedSkillIds: ['skill-1', 'skill-2'],
    relatedProjectIds: ['proj-1'],
    status: 'SUPPORTED',
    extractionSnippet: 'Benchmarking 50k msgs/sec throughput. Explaining PostgreSQL partitioned audit tables and Redis consumer groups.',
    confidenceScore: 92,
    humanReviewed: true,
  },
  {
    id: 'ev-code-2',
    candidateId: DEV_CANDIDATE_ID,
    filename: 'MetricsTable.tsx',
    source: 'Portfolio Repository',
    evidenceType: 'Source Code',
    fileSize: 31200,
    fileType: 'text/typescript',
    uploadedAt: '2026-09-18T10:18:00Z',
    relatedSkillIds: ['skill-6'],
    relatedProjectIds: ['proj-2'],
    status: 'SUPPORTED',
    extractionSnippet: 'export const MetricsTable = ({ nodes }: MetricsProps) => { const memoized = useMemo(...); ... }',
    confidenceScore: 95,
    humanReviewed: true,
  },
  {
    id: 'ev-screen-1',
    candidateId: DEV_CANDIDATE_ID,
    filename: 'telemetry_console_live_screenshot.png',
    source: 'Screenshot Evidence',
    evidenceType: 'Screenshot',
    fileSize: 498200,
    fileType: 'image/png',
    uploadedAt: '2026-09-18T10:20:00Z',
    relatedSkillIds: ['skill-6'],
    relatedProjectIds: ['proj-2'],
    status: 'SUPPORTED',
    extractionSnippet: 'Screenshot depicting live Prometheus latency histogram and React dashboard layout.',
    confidenceScore: 89,
    humanReviewed: false,
  },
  {
    id: 'ev-cert-1',
    candidateId: DEV_CANDIDATE_ID,
    filename: 'CNCF_CKAD_Certificate.pdf',
    source: 'Certificate Upload',
    evidenceType: 'Certificate',
    fileSize: 224000,
    fileType: 'application/pdf',
    uploadedAt: '2026-09-18T10:22:00Z',
    relatedSkillIds: ['skill-3'],
    relatedProjectIds: [],
    status: 'SUPPORTED',
    extractionSnippet: 'The Linux Foundation and CNCF certify Alex Chen as Certified Kubernetes Application Developer.',
    confidenceScore: 99,
    humanReviewed: true,
  },
  {
    id: 'ev-cert-2',
    candidateId: DEV_CANDIDATE_ID,
    filename: 'AWS_Certificate_Badge.png',
    source: 'Badge Verification Upload',
    evidenceType: 'Certificate',
    fileSize: 154000,
    fileType: 'image/png',
    uploadedAt: '2026-09-18T10:25:00Z',
    relatedSkillIds: ['skill-5'],
    relatedProjectIds: [],
    status: 'CONFLICTING',
    conflicts: 'Resume claims AWS Solutions Architect Professional (SAP-C02). Uploaded badge confirms Solutions Architect Associate (SAA-C03).',
    missingInformation: 'Proof of Professional level certification not provided.',
    confidenceScore: 88,
    humanReviewed: true,
    reviewerComment: 'Badge discrepancy identified. Downgraded AWS Architecture verification state.',
  },
  {
    id: 'ev-chal-1',
    candidateId: DEV_CANDIDATE_ID,
    filename: 'python_concurrency_submission.py',
    source: 'Practical Challenge Engine',
    evidenceType: 'Practical Challenge',
    fileSize: 18900,
    fileType: 'text/x-python',
    uploadedAt: '2026-09-18T11:45:00Z',
    relatedSkillIds: ['skill-1'],
    relatedProjectIds: ['proj-1'],
    status: 'SUPPORTED',
    extractionSnippet: 'Candidate submitted thread-safe rate limiter with sliding window counter using Redis Lua script.',
    confidenceScore: 100,
    humanReviewed: true,
  },
];

export const DEV_RELATIONSHIPS: EvidenceRelationship[] = [
  {
    id: 'rel-1',
    sourceId: DEV_CANDIDATE_ID,
    sourceType: 'Candidate',
    sourceLabel: 'Alex Chen',
    targetId: 'claim-1',
    targetType: 'Claim',
    targetLabel: 'Python Microservices',
    relationship: 'CLAIMS',
    confidence: 100,
    explanation: 'Candidate explicitly declared 6 years of Python concurrency in uploaded resume.',
  },
  {
    id: 'rel-2',
    sourceId: 'ev-code-1',
    sourceType: 'Evidence',
    sourceLabel: 'async_worker_pool.py',
    targetId: 'skill-1',
    targetType: 'Skill',
    targetLabel: 'Python',
    relationship: 'SUPPORTS',
    confidence: 96,
    explanation: 'Production source code demonstrates idiomatic asyncio, semaphores, and structured task cancellation.',
  },
  {
    id: 'rel-3',
    sourceId: 'ev-chal-1',
    sourceType: 'Evidence',
    sourceLabel: 'Challenge Submission #402',
    targetId: 'skill-1',
    targetType: 'Skill',
    targetLabel: 'Python',
    relationship: 'PROVES',
    confidence: 100,
    explanation: 'Candidate solved the rate limiter concurrency challenge passing 100% of stress test cases.',
  },
  {
    id: 'rel-4',
    sourceId: 'ev-doc-1',
    sourceType: 'Evidence',
    sourceLabel: 'RFC-014 Architecture Doc',
    targetId: 'skill-2',
    targetType: 'Skill',
    targetLabel: 'PostgreSQL',
    relationship: 'SUPPORTS',
    confidence: 92,
    explanation: 'RFC contains exact table partitioning strategies and query execution plans.',
  },
  {
    id: 'rel-5',
    sourceId: 'ev-cert-1',
    sourceType: 'Evidence',
    sourceLabel: 'CNCF CKAD Certificate',
    targetId: 'skill-3',
    targetType: 'Skill',
    targetLabel: 'Kubernetes',
    relationship: 'PARTIALLY_SUPPORTS',
    confidence: 80,
    explanation: 'Valid CKAD certification confirms basic orchestration knowledge, but production IaC manifests remain missing.',
  },
  {
    id: 'rel-6',
    sourceId: 'claim-4',
    sourceType: 'Claim',
    sourceLabel: 'Go (Golang) Services',
    targetId: 'skill-4',
    targetType: 'Skill',
    targetLabel: 'Go (Golang)',
    relationship: 'REQUIRES_REVIEW',
    confidence: 30,
    explanation: 'Zero Go code or test evidence provided despite high-level resume claim.',
  },
  {
    id: 'rel-7',
    sourceId: 'ev-cert-2',
    sourceType: 'Evidence',
    sourceLabel: 'AWS Certificate Badge',
    targetId: 'claim-6',
    targetType: 'Claim',
    targetLabel: 'AWS Architect Pro Claim',
    relationship: 'CONFLICTS_WITH',
    confidence: 95,
    explanation: 'Uploaded credential badge is Associate tier, contradicting the claimed Professional certification.',
  },
];

export const DEV_PRACTICAL_CHALLENGES: PracticalChallenge[] = [
  {
    id: 'chal-1',
    role: 'Python Developer / Backend Engineer',
    title: 'Async Rate Limiter with Sliding Window',
    skillTested: 'Python',
    difficulty: 'Senior',
    whyRecommended: 'Validates candidate claimed expert concurrency and async queue resilience.',
    promptText: 'Implement an asynchronous sliding window rate limiter in Python capable of handling 5,000 requests/sec with graceful backpressure.',
    instructions: [
      'Write an AsyncRateLimiter class with acquire() and try_acquire() methods.',
      'Ensure memory efficiency: expired window timestamps must be purged automatically.',
      'Include unit test simulation for burst requests exceeding window limit.',
    ],
    starterCode: `import asyncio
import time
from typing import Optional

class AsyncRateLimiter:
    def __init__(self, max_requests: int, window_seconds: float):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._lock = asyncio.Lock()
        # TODO: Initialize window storage

    async def acquire(self) -> bool:
        """Wait until a slot is available, then acquire."""
        async with self._lock:
            # Implement sliding window algorithm
            pass
`,
    expectedOutput: 'RateLimiter blocks requests exceeding 50 req/sec and handles clean timeout.',
  },
  {
    id: 'chal-2',
    role: 'Backend Developer',
    title: 'Go (Golang) Concurrent Worker Pipeline',
    skillTested: 'Go (Golang)',
    difficulty: 'Mid',
    whyRecommended: 'CRITICAL MISSING PROOF: Candidate claims 3 yrs Go on resume, but zero Go evidence exists in repository bundle.',
    promptText: 'Implement a fan-out / fan-in worker pool in Go with cancellation via context.Context and error aggregation.',
    instructions: [
      'Define an interface for Job and Result.',
      'Dispatch jobs to N concurrent goroutines reading from a shared channel.',
      'Ensure no goroutine leaks upon context cancellation.',
    ],
    starterCode: `package main

import (
    "context"
    "fmt"
    "sync"
)

type Job struct {
    ID    int
    Value string
}

func WorkerPool(ctx context.Context, numWorkers int, jobs <-chan Job) <-chan string {
    results := make(chan string)
    // TODO: Implement fan-out fan-in pipeline
    return results
}
`,
    expectedOutput: 'All jobs processed concurrently without data races; clean shutdown on SIGINT.',
  },
  {
    id: 'chal-3',
    role: 'Frontend Developer',
    title: 'Virtualized Virtual-DOM Infinite Data Table',
    skillTested: 'TypeScript & React',
    difficulty: 'Senior',
    whyRecommended: 'Validates performant DOM rendering and high-frequency state updates.',
    promptText: 'Construct a virtualized React list rendering 100,000 telemetry rows maintaining 60 FPS scrolling.',
    instructions: [
      'Calculate window boundaries using row height and scrollTop.',
      'Only mount visible DOM elements plus an overscan buffer of 5 items.',
      'Provide smooth scroll tracking without layout thrashing.',
    ],
    starterCode: `import React, { useRef, useState, useEffect } from 'react';

export function VirtualList({ items, rowHeight = 40, viewportHeight = 400 }) {
  const [scrollTop, setScrollTop] = useState(0);
  // TODO: Compute startIndex and endIndex
  return (
    <div style={{ height: viewportHeight, overflowY: 'auto' }}>
      {/* Render virtualized window */}
    </div>
  );
}
`,
    expectedOutput: 'Maintains 60 FPS scrolling with memory footprint under 30MB.',
  },
  {
    id: 'chal-4',
    role: 'Data Engineer',
    title: 'PostgreSQL Time-Series Partition Maintenance Function',
    skillTested: 'PostgreSQL',
    difficulty: 'Senior',
    whyRecommended: 'Validates automated schema maintenance for large-scale audit logs.',
    promptText: 'Write a PL/pgSQL function that creates next month’s partition automatically and drops partitions older than 90 days.',
    instructions: [
      'Use CREATE TABLE ... PARTITION OF with explicit bounds.',
      'Implement transaction-safe locking.',
      'Include cron or pg_timetable trigger definition.',
    ],
    starterCode: `-- PL/pgSQL Partition Maintenance
CREATE OR REPLACE FUNCTION maintain_telemetry_partitions()
RETURNS void AS $$
BEGIN
    -- TODO: Compute boundary dates and invoke DDL
END;
$$ LANGUAGE plpgsql;
`,
    expectedOutput: 'Partitions dynamically created and pruned without table locks.',
  },
];

export const DEV_SUBMISSIONS: ChallengeSubmission[] = [
  {
    id: 'sub-1',
    challengeId: 'chal-1',
    candidateId: DEV_CANDIDATE_ID,
    submissionType: 'code',
    content: `import asyncio
import time
from collections import deque

class AsyncRateLimiter:
    def __init__(self, max_requests: int, window_seconds: float):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._lock = asyncio.Lock()
        self._timestamps = deque()

    async def acquire(self) -> bool:
        while True:
            async with self._lock:
                now = time.monotonic()
                while self._timestamps and self._timestamps[0] <= now - self.window_seconds:
                    self._timestamps.popleft()
                if len(self._timestamps) < self.max_requests:
                    self._timestamps.append(now)
                    return True
                wait_time = self._timestamps[0] - (now - self.window_seconds)
            await asyncio.sleep(max(wait_time, 0.005))
`,
    filename: 'async_sliding_limiter.py',
    submittedAt: '2026-09-18T11:45:00Z',
    evaluationEvidence: 'Benchmarked against 10 concurrent async producers. Zero race conditions detected. Memory bound checked with collections.deque.',
    result: 'Pass - Strong Proof',
    provenSkills: ['Python', 'AsyncIO', 'Concurrency'],
    scorePercentage: 96,
    explainableBreakdown: [
      'Sliding window algorithm correctness: 100%',
      'Concurrency safety (Asyncio Lock usage): 95%',
      'Memory cleanup of expired timestamps: 100%',
      'Edge-case latency under burst loads: 92%',
    ],
  },
];

export const DEV_ASSESSMENTS: Assessment[] = [
  {
    id: 'ass-1',
    candidateId: DEV_CANDIDATE_ID,
    title: 'Distributed Systems & Microservices Assessment',
    category: 'Architecture & System Design',
    date: '2026-09-18',
    scoreExplainable: '46/50 (92%) — Verified CAP theorem tradeoffs, idempotent consumer patterns, and dead-letter queue recovery.',
    verifiedSkills: ['Distributed Systems', 'System Design', 'Message Queues'],
    status: 'Completed',
    evidenceId: 'ev-chal-1',
  },
];

export const DEV_TIMELINE: VerificationEvent[] = [
  {
    id: 'evt-1',
    candidateId: DEV_CANDIDATE_ID,
    timestamp: '2026-09-18T10:00:15Z',
    eventType: 'Resume Uploaded',
    actor: 'Recruiter Ingestion System',
    details: 'Uploaded AlexChen_Senior_Systems_Resume.pdf (184 KB).',
    sourceRef: 'ev-resume-1',
  },
  {
    id: 'evt-2',
    candidateId: DEV_CANDIDATE_ID,
    timestamp: '2026-09-18T10:00:32Z',
    eventType: 'Claims Extracted',
    actor: 'SkillProof Ingestion Engine',
    details: 'Extracted 6 primary skill claims and 2 key project accomplishments.',
  },
  {
    id: 'evt-3',
    candidateId: DEV_CANDIDATE_ID,
    timestamp: '2026-09-18T10:15:00Z',
    eventType: 'Evidence Uploaded',
    actor: 'Candidate Portal',
    details: 'Ingested 5 technical evidence files (source code, RFC document, certificates).',
  },
  {
    id: 'evt-4',
    candidateId: DEV_CANDIDATE_ID,
    timestamp: '2026-09-18T10:25:40Z',
    eventType: 'Verification Performed',
    actor: 'Claim & Evidence Matcher',
    details: 'Matched Python & PostgreSQL to production code. Flagged AWS certificate conflict. Flagged Go as missing proof.',
  },
  {
    id: 'evt-5',
    candidateId: DEV_CANDIDATE_ID,
    timestamp: '2026-09-18T11:45:00Z',
    eventType: 'Challenge Submitted',
    actor: 'Alex Chen',
    details: 'Submitted practical challenge "Async Rate Limiter with Sliding Window". Evaluated with Strong Proof.',
    sourceRef: 'sub-1',
  },
  {
    id: 'evt-6',
    candidateId: DEV_CANDIDATE_ID,
    timestamp: '2026-09-18T12:00:00Z',
    eventType: 'Human Review',
    actor: 'Elena Rostova (Lead Recruiter)',
    details: 'Verified code quality. Confirmed AWS badge conflict notes and approved Python proof level.',
  },
];
