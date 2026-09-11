import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { TaskStatus, Priority } from '../types';
import { Filter, X } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get('status') || '';
  const currentPriority = searchParams.get('priority') || '';
  const dueDateFrom = searchParams.get('dueDateFrom') || '';
  const dueDateTo = searchParams.get('dueDateTo') || '';

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(currentStatus || currentPriority || dueDateFrom || dueDateTo);

  return (
    <div className="glass-panel p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
          <Filter className="w-3.5 h-3.5 text-brand-400" />
          Filter Tasks:
        </div>

        {/* Status Filter */}
        <select
          value={currentStatus}
          onChange={(e) => updateParam('status', e.target.value)}
          className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-brand-500 outline-none font-medium cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>

        {/* Priority Filter */}
        <select
          value={currentPriority}
          onChange={(e) => updateParam('priority', e.target.value)}
          className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-brand-500 outline-none font-medium cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        {/* Date From */}
        <div className="flex items-center gap-1 text-slate-400">
          <span>From:</span>
          <input
            type="date"
            value={dueDateFrom}
            onChange={(e) => updateParam('dueDateFrom', e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-1 text-slate-400">
          <span>To:</span>
          <input
            type="date"
            value={dueDateTo}
            onChange={(e) => updateParam('dueDateTo', e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-rose-950/30 hover:bg-rose-950/60 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear Filters
        </button>
      )}
    </div>
  );
};
