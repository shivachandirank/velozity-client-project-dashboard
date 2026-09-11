import React from 'react';
import { Priority } from '../types';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

const priorityConfig: Record<Priority, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  LOW: { label: 'Low', bg: 'bg-slate-800', text: 'text-slate-400', icon: ArrowDown },
  MEDIUM: { label: 'Medium', bg: 'bg-blue-950/60', text: 'text-blue-400', icon: ArrowUp },
  HIGH: { label: 'High', bg: 'bg-orange-950/60', text: 'text-orange-400', icon: AlertTriangle },
  CRITICAL: { label: 'Critical', bg: 'bg-rose-950/80', text: 'text-rose-400', icon: AlertCircle },
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};
