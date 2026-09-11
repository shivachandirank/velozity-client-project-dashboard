import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="glass-panel p-8 rounded-xl text-center flex flex-col items-center justify-center space-y-3 my-4 border border-dashed border-slate-800">
      <div className="p-3 bg-slate-900 rounded-full text-slate-500">
        <Inbox className="w-8 h-8" />
      </div>
      <h3 className="font-semibold text-slate-200 text-base">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
