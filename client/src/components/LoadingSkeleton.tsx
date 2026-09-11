import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-panel p-4 rounded-xl space-y-3 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-800/60 rounded w-full" />
          <div className="h-3 bg-slate-800/60 rounded w-2/3" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-slate-800 rounded w-20" />
            <div className="h-4 bg-slate-800 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};
