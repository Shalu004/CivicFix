import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyle = (st) => {
    switch (st?.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'IN_PROGRESS':
        return 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20';
      case 'RESOLVED':
        return 'bg-green-50 text-green-700 border-green-200 ring-green-500/20';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
      case 'ESCALATED':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20';
    }
  };

  const formatText = (st) => {
    if (!st) return 'Unknown';
    return st.replace('_', ' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ring-1 ring-inset ${getStyle(status)}`}>
      {formatText(status)}
    </span>
  );
};

export default StatusBadge;
