import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, HelpCircle, Eye } from 'lucide-react';
import { VerificationStatus } from '../../types';

interface StatusBadgeProps {
  status: VerificationStatus | 'Pass - Strong Proof' | 'Pass - Adequate' | 'Needs Improvement' | 'Failed' | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const norm = status ? status.toUpperCase().trim() : 'UNVERIFIED';

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = HelpCircle;

  switch (norm) {
    case 'SUPPORTED':
    case 'PASS - STRONG PROOF':
    case 'PROVEN':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = CheckCircle2;
      break;
    case 'PARTIALLY SUPPORTED':
    case 'PASS - ADEQUATE':
      bg = 'bg-sky-50 text-sky-700 border-sky-200';
      Icon = ShieldCheck;
      break;
    case 'INSUFFICIENT':
    case 'INSUFFICIENT EVIDENCE':
    case 'NOT YET VERIFIED':
    case 'NEEDS IMPROVEMENT':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = Clock;
      break;
    case 'CONFLICTING':
    case 'FAILED':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      break;
    case 'REQUIRES HUMAN REVIEW':
    case 'REQUIRES REVIEW':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = AlertTriangle;
      break;
    case 'EXTRACTED':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = Eye;
      break;
    case 'PROCESSING':
    case 'QUEUED':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      Icon = Clock;
      break;
    default:
      bg = 'bg-slate-100 text-slate-700 border-slate-200';
      Icon = HelpCircle;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      id={`status-badge-${norm.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`inline-flex items-center rounded-md border tracking-tight uppercase ${sizeClasses} ${bg} font-mono`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{status}</span>
    </span>
  );
};
