import React from 'react';
import { TaskStatus } from '../types';

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; border: string }> = {
  TODO: { label: 'To Do', bg: 'bg-slate-800/80', text: 'text-slate-300', border: 'border-slate-700' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  IN_REVIEW: { label: 'In Review', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  DONE: { label: 'Done', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.TODO;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
};
