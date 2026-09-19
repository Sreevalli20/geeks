import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Download,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseJsonImport, parseCsvImport, ImportPreviewResult } from '../services/imports';

export const ImportCenterPage: React.FC = () => {
  const { importRecords, navigateTo } = useApp();

  const [importResult, setImportResult] = useState<ImportPreviewResult | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportSuccessMessage(null);

    try {
      const text = await file.text();
      let res: ImportPreviewResult;

      if (file.name.endsWith('.json') || file.type.includes('json')) {
        res = parseJsonImport(text);
      } else {
        res = parseCsvImport(text);
      }

      setImportResult(res);
      // Select all valid records by default
      setSelectedIndices(res.records.map((_: any, idx: number) => idx));
    } catch (err: any) {
      setImportResult({
        validCount: 0,
        duplicateCount: 0,
        errorCount: 1,
        errors: [err.message || 'Failed to read file.'],
        records: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImport = () => {
    if (!importResult) return;
    const recordsToImport = importResult.records.filter((_: any, idx: number) => selectedIndices.includes(idx));
    const importedCount = importRecords(recordsToImport);

    setImportSuccessMessage(`Successfully imported ${importedCount} records into SkillProof application state.`);
    setImportResult(null);
  };

  const handleToggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  /**
   * One-click Sample Candidate JSON loader
   */
  const handleLoadSampleJson = () => {
    const sample = [
      {
        name: 'Jordan Rivera',
        detectedRole: 'Staff Infrastructure & Kubernetes Architect',
        email: 'jordan.rivera@example.io',
        summary: 'Specialized in multi-cloud Kubernetes clusters, Terraform automation, and Istio service mesh.',
        keySkills: ['Kubernetes', 'Go', 'Terraform', 'Docker', 'AWS', 'Istio'],
        claims: [
          {
            title: 'Kubernetes Cluster Fleet Management',
            description: 'Maintained 40+ EKS clusters spanning 3 AWS regions with 99.99% uptime SLA.',
            claimType: 'Technical Skill',
            evidenceStatus: 'Supported',
          },
          {
            title: 'Zero-Downtime Migration',
            description: 'Migrated 300 microservices from legacy ECS to EKS with zero customer disruption.',
            claimType: 'Project Achievement',
            evidenceStatus: 'Partially Supported',
          },
        ],
      },
    ];

    const res = parseJsonImport(JSON.stringify(sample));
    setImportResult(res);
    setSelectedIndices(res.records.map((_: any, idx: number) => idx));
  };

  return (
    <div id="import-center-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Structured Import Center
            </h1>
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              JSON & CSV
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Ingest structured candidate profiles, skill claims, and technical records in bulk
          </p>
        </div>

        <button
          onClick={handleLoadSampleJson}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-semibold transition-colors shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Load Sample JSON Template</span>
        </button>
      </div>

      {/* Success Notification */}
      {importSuccessMessage && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/90 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{importSuccessMessage}</span>
          </div>
          <button
            onClick={() => navigateTo('candidates')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-semibold"
          >
            <span>View Candidates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white rounded-xl text-center cursor-pointer transition-colors shadow-2xs"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,.csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 mx-auto mb-3">
          {isProcessing ? (
            <RefreshCw className="w-6 h-6 animate-spin text-slate-600" />
          ) : (
            <FileSpreadsheet className="w-6 h-6 text-slate-700" />
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-900">
          Upload JSON or CSV Candidate Records
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Schema is validated client-side with duplicate detection and selectable partial import.
        </p>

        <div className="mt-4">
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
          >
            Browse JSON or CSV
          </button>
        </div>
      </div>

      {/* Import Preview & Duplicate Detection Table */}
      {importResult && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Import Preview & Validation Summary
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Valid: {importResult.validCount} | Duplicates: {importResult.duplicateCount} | Errors: {importResult.errorCount}
              </p>
            </div>

            <button
              id="btn-execute-import"
              onClick={handleExecuteImport}
              disabled={selectedIndices.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
            >
              <span>Import Selected ({selectedIndices.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Error messages if any */}
          {importResult.errors.length > 0 && (
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800 space-y-1">
              <span className="font-bold block">Validation Warnings / Errors:</span>
              {importResult.errors.map((err: string, i: number) => (
                <p key={i}>• {err}</p>
              ))}
            </div>
          )}

          {/* Record table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono">
                <tr>
                  <th className="p-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIndices.length === importResult.records.length}
                      onChange={(e) =>
                        setSelectedIndices(e.target.checked ? importResult.records.map((_: any, i: number) => i) : [])
                      }
                    />
                  </th>
                  <th className="p-3">Candidate Name</th>
                  <th className="p-3">Detected Role</th>
                  <th className="p-3">Key Skills</th>
                  <th className="p-3">Extracted Claims</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {importResult.records.map((rec: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIndices.includes(idx)}
                        onChange={() => handleToggleSelect(idx)}
                      />
                    </td>
                    <td className="p-3 font-bold text-slate-900">{rec.name}</td>
                    <td className="p-3 text-slate-600">{rec.detectedRole}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">
                      {rec.keySkills?.join(', ') || 'None'}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {rec.claims?.length || 0} claims
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
