import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Image as ImageIcon,
  Trash2,
  Eye,
  RefreshCw,
  FolderArchive,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { detectCategoryFromFilename } from '../services/uploads';

export const UploadCenterPage: React.FC = () => {
  const {
    uploadResumeFile,
    uploadEvidenceFiles,
    uploadedQueue,
    isProcessingUpload,
    uploadError,
    activeCandidate,
    setPreviewEvidence,
    evidence,
    navigateTo,
  } = useApp();

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMode, setUploadMode] = useState<'resume' | 'evidence'>('resume');
  const [recentUploadedCandidateId, setRecentUploadedCandidateId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    if (uploadMode === 'resume') {
      const resumeFile = files.find(
        (f) =>
          f.name.toLowerCase().includes('resume') ||
          f.name.toLowerCase().includes('cv') ||
          f.type.includes('pdf') ||
          f.name.endsWith('.txt') ||
          f.name.endsWith('.md') ||
          f.name.endsWith('.docx')
      ) || files[0];

      try {
        const newCandidateId = await uploadResumeFile(resumeFile);
        setRecentUploadedCandidateId(newCandidateId);

        // If additional files were dropped, ingest as supporting evidence
        const otherFiles = files.filter((f) => f !== resumeFile);
        if (otherFiles.length > 0) {
          await uploadEvidenceFiles(otherFiles, newCandidateId);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Evidence mode
      await uploadEvidenceFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  /**
   * One-click Sample Real Resume Injector
   * Creates real browser File objects using Blob to demonstrate the end-to-end zero-manual-data extraction
   */
  const handleLoadSampleResume = async () => {
    const sampleResumeText = `Maya Lin
San Francisco, CA | maya.lin.eng@example.com | (415) 555-0182
GitHub: github.com/mayalin-dev | Portfolio: mayalin.dev | LinkedIn: linkedin.com/in/mayalin-eng

SUMMARY
Senior Backend & Distributed Systems Engineer with 7 years experience architecting high-throughput microservices in Go, Python, and Rust. Specialized in Kafka event streaming, PostgreSQL performance tuning, and Kubernetes orchestration.

TECHNICAL SKILLS
Languages: Go, Python, Rust, TypeScript, SQL
Frameworks: FastAPI, Gin, React, Next.js
Databases: PostgreSQL, Redis, MongoDB, Elasticsearch
Cloud & DevOps: Kubernetes, Docker, AWS (EKS, RDS, S3), Terraform, CI/CD
Architecture: Microservices, Distributed Systems, Event-Driven Architecture, REST API, GraphQL

EXPERIENCE
Staff Backend Engineer | HyperScale Data | 2022 - Present
- Designed distributed ingestion pipeline processing 80,000 events/second using Go and Kafka.
- Re-architected PostgreSQL partitioned databases, decreasing query latency by 45%.
- Implemented zero-downtime Kubernetes deployments with automated canary analysis.

Senior Software Engineer | VectorStream Labs | 2019 - 2022
- Built FastAPI microservices in Python with Redis caching, serving 12M monthly active requests.
- Created real-time telemetry dashboard in React and TypeScript.

EDUCATION
B.S. in Computer Science | Stanford University | 2019
`;

    const sampleFile = new File([sampleResumeText], 'Maya_Lin_Senior_Backend_Resume.txt', {
      type: 'text/plain',
    });

    try {
      const newCandId = await uploadResumeFile(sampleFile);
      setRecentUploadedCandidateId(newCandId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="upload-center-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Upload & Evidence Ingestion Center
            </h1>
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Zero-Manual-Data
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real browser file processing • PDF, DOCX, TXT, PNG, JPG, ZIP, JSON, CSV
          </p>
        </div>

        {/* Quick Sample Button */}
        <button
          id="btn-load-sample-resume"
          onClick={handleLoadSampleResume}
          disabled={isProcessingUpload}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold transition-colors shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Ingest Real Sample Resume (Maya Lin)</span>
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setUploadMode('resume')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            uploadMode === 'resume'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          1. Upload Candidate Resume
        </button>
        <button
          onClick={() => setUploadMode('evidence')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            uploadMode === 'evidence'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          2. Upload Supporting Evidence (Code, Screenshot, Docs)
        </button>
      </div>

      {/* Target candidate indicator for evidence mode */}
      {uploadMode === 'evidence' && activeCandidate && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Target Candidate:</span>
            <span className="font-bold text-slate-900">{activeCandidate.name}</span>
            <span className="text-slate-500">({activeCandidate.detectedRole})</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Files will auto-associate with candidate claims & skills
          </span>
        </div>
      )}

      {/* Error Banner */}
      {uploadError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Drag & Drop Dropzone */}
      <div
        id="dropzone-upload-area"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-150 ${
          isDragOver
            ? 'border-slate-900 bg-slate-100/70 scale-[0.99]'
            : 'border-slate-300 hover:border-slate-400 bg-white shadow-2xs'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.zip,.tar,.json,.csv,.md,.py,.ts,.tsx,.js,.jsx,.go,.java,.sql"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 mx-auto mb-4 shadow-2xs">
          {isProcessingUpload ? (
            <RefreshCw className="w-7 h-7 animate-spin text-slate-600" />
          ) : (
            <UploadCloud className="w-7 h-7 text-slate-700" />
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900">
          {uploadMode === 'resume'
            ? 'Drag & drop candidate resume here'
            : 'Drag & drop supporting evidence files here'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          {uploadMode === 'resume'
            ? 'SkillProof automatically extracts identity, degree, claimed skills, and projects without manual data entry.'
            : 'Upload code samples (.py, .go, .ts), screenshots (.png, .jpg), RFC docs (.md), certificates (.pdf), or archives (.zip).'}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
          <span className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200">PDF</span>
          <span className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200">DOCX</span>
          <span className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200">TXT</span>
          <span className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200">PNG / JPG</span>
          <span className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200">ZIP</span>
          <span className="px-2 py-0.5 rounded-sm bg-slate-100 border border-slate-200">CODE</span>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
          >
            Browse Local Files
          </button>
        </div>
      </div>

      {/* Success Notification with CTA */}
      {recentUploadedCandidateId && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950 block">
                Candidate Extracted & Ingested Successfully!
              </span>
              <span className="text-emerald-800">
                Skills and projects automatically parsed into explicit claims.
              </span>
            </div>
          </div>
          <button
            id="btn-goto-claim-vs-proof-uploaded"
            onClick={() => navigateTo('claim-vs-proof')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
          >
            <span>Inspect Claim vs Proof</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Uploaded Files Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Processed Uploads & Artifact Vault ({uploadedQueue.length + evidence.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">Real browser file state</span>
        </div>

        {evidence.length === 0 && uploadedQueue.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            No files uploaded yet. Drag & drop files above to start extraction.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono">
                <tr>
                  <th className="p-3">Filename</th>
                  <th className="p-3">Evidence Category</th>
                  <th className="p-3">File Size</th>
                  <th className="p-3">Extraction Status</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evidence.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          {ev.evidenceType === 'Source Code' ? (
                            <FileCode className="w-3.5 h-3.5" />
                          ) : ev.evidenceType === 'Screenshot' ? (
                            <ImageIcon className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block max-w-xs truncate">
                            {ev.filename}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{ev.fileType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                        {ev.evidenceType}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {(ev.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="p-3">
                      <StatusBadge status={ev.status} size="sm" />
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-mono font-medium text-slate-700">
                        {ev.confidenceScore || 90}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setPreviewEvidence(ev)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
