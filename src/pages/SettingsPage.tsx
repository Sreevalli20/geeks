import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Trash2,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/api';

export const SettingsPage: React.FC = () => {
  const {
    candidates,
    claims,
    skills,
    evidence,
    clearAllData,
  } = useApp();

  const [confirmClear, setConfirmClear] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    setApiStatus('checking');
    setApiError(null);
    try {
      await apiClient.get('/api/health/');
      setApiStatus('connected');
    } catch (error) {
      setApiStatus('failed');
      setApiError(error instanceof Error ? error.message : 'API connection failed');
    }
  };

  const handleClearAll = () => {
    clearAllData();
    setConfirmClear(false);
    setSuccessMsg('All candidate records, claims, skills, and evidence cleared.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div id="settings-view" className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">System Settings & Data Engine</h1>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Manage local state persistence, sample datasets, and future backend connectors
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Product Information Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">SkillProof Platform</h3>
            <p className="text-xs text-slate-500 font-mono">DON'T HIRE THE RESUME. HIRE THE PROOF.</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
          SkillProof is an AI-powered evidence-based hiring platform that transforms a candidate's resume and submitted work into an explainable proof profile.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Candidates</span>
            <span className="font-bold text-slate-900 font-mono">{candidates.length}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Claims</span>
            <span className="font-bold text-slate-900 font-mono">{claims.length}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Skills</span>
            <span className="font-bold text-slate-900 font-mono">{skills.length}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Evidence</span>
            <span className="font-bold text-slate-900 font-mono">{evidence.length}</span>
          </div>
        </div>
      </div>

      {/* Backend Integration Readiness */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Backend Integration Connector</h3>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Current Execution Engine:</span>
            <span className="font-mono px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              In-Browser State (Zero-API Required)
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            All services in <code className="text-slate-800 font-mono">/src/services/api.ts</code> are wired to seamlessly switch to network calls whenever <code className="text-slate-800 font-mono">VITE_API_URL</code> is defined in the environment.
          </p>
        </div>

        {/* SkillProof API Test */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">SkillProof API Test</span>
            <button
              onClick={checkApiHealth}
              disabled={apiStatus === 'checking'}
              className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium disabled:opacity-50"
            >
              {apiStatus === 'checking' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {apiStatus === 'connected' && (
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">API Connection: PASS</span>
            </div>
          )}

          {apiStatus === 'failed' && (
            <div className="flex items-start gap-2 text-rose-700">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">API Connection: FAIL</span>
                {apiError && <p className="text-[11px] mt-1">{apiError}</p>}
              </div>
            </div>
          )}

          {apiStatus === 'checking' && (
            <div className="flex items-center gap-2 text-slate-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Testing API connection...</span>
            </div>
          )}
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Application State Management</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-rose-200 bg-rose-50/50">
          <div>
            <h4 className="text-xs font-bold text-rose-950">Clear All In-Memory State</h4>
            <p className="text-[11px] text-rose-700">
              Permanently wipe all current candidates, claims, and evidence to test pristine empty states.
            </p>
          </div>

          {confirmClear ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Confirm Wipe
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 text-xs font-semibold shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All State</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
